const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL = "gemini-3.8-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const ANALYSIS_PROMPT = `You are a nutrition estimation assistant. Analyze the meal photo and respond only with JSON that matches the required schema.
- food_items: the distinct foods you can see.
- likely_ingredients: ingredients likely used, including hidden ones such as oil, butter, or sauces when plausible.
- estimated_portion: a short description of the visible portion, such as "about 1 plate, roughly 350 g".
- estimated_calories, protein_g, carbohydrates_g, fat_g, fiber_g: estimates for the visible portion as numbers. Use null when the photo does not give enough information to estimate that value.
- uncertainty_notes: explain what limits accuracy, such as hidden ingredients, unclear portion size, mixed dishes, or poor lighting. If the image does not show food, leave food_items empty and say so here.
- follow_up_suggestions: up to three short questions or tips that would make the estimate more accurate.
Every value is an estimate. Never present estimates as exact and do not invent precision.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    food_items: { type: "ARRAY", items: { type: "STRING" } },
    likely_ingredients: { type: "ARRAY", items: { type: "STRING" } },
    estimated_portion: { type: "STRING", nullable: true },
    estimated_calories: { type: "NUMBER", nullable: true },
    protein_g: { type: "NUMBER", nullable: true },
    carbohydrates_g: { type: "NUMBER", nullable: true },
    fat_g: { type: "NUMBER", nullable: true },
    fiber_g: { type: "NUMBER", nullable: true },
    uncertainty_notes: { type: "ARRAY", items: { type: "STRING" } },
    follow_up_suggestions: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: [
    "food_items",
    "likely_ingredients",
    "estimated_portion",
    "estimated_calories",
    "protein_g",
    "carbohydrates_g",
    "fat_g",
    "fiber_g",
    "uncertainty_notes",
    "follow_up_suggestions",
  ],
};

const MODEL_RETRY_DELAYS_MS = [2_000, 5_000, 5_000];
const GEMINI_ATTEMPT_TIMEOUT_MS = 60_000;

function callGemini(apiKey: string, body: string): Promise<Response> {
  return fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body,
    signal: AbortSignal.timeout(GEMINI_ATTEMPT_TIMEOUT_MS),
  });
}

async function callGeminiWithRetry(apiKey: string, body: string): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const response = await callGemini(apiKey, body);
    if (response.status !== 503 || attempt >= MODEL_RETRY_DELAYS_MS.length) return response;
    await response.body?.cancel();
    await new Promise((resolve) => setTimeout(resolve, MODEL_RETRY_DELAYS_MS[attempt]));
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fail(status: number, code: string, message: string) {
  return json({ error: code, message }, status);
}

function detectImageType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
  const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (isRiff && isWebp) return "image/webp";
  return null;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function cleanStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= 160)
    .slice(0, 20);
}

function cleanNumber(value: unknown, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > max) return null;
  return Math.round(value * 10) / 10;
}

function normalizeAnalysis(raw: unknown) {
  const source = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const portion = typeof source.estimated_portion === "string" ? source.estimated_portion.trim() : "";
  return {
    food_items: cleanStrings(source.food_items),
    likely_ingredients: cleanStrings(source.likely_ingredients),
    estimated_portion: portion.length > 0 ? portion.slice(0, 200) : null,
    estimated_calories: cleanNumber(source.estimated_calories, 5000),
    protein_g: cleanNumber(source.protein_g, 500),
    carbohydrates_g: cleanNumber(source.carbohydrates_g, 500),
    fat_g: cleanNumber(source.fat_g, 500),
    fiber_g: cleanNumber(source.fiber_g, 200),
    uncertainty_notes: cleanStrings(source.uncertainty_notes),
    follow_up_suggestions: cleanStrings(source.follow_up_suggestions),
  };
}

function extractModelText(payload: unknown): string {
  const parts = (payload as { candidates?: { content?: { parts?: { text?: unknown; thought?: boolean }[] } }[] })
    ?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((part) => typeof part.text === "string" && part.thought !== true)
    .map((part) => part.text as string)
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return fail(405, "invalid_file", "Use POST to send a photo.");
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return fail(500, "missing_key", "The Gemini API key is not set up on the server yet.");
    }

    let imageFile: File | null = null;
    try {
      const form = await req.formData();
      const candidate = form.get("image");
      imageFile = candidate instanceof File ? candidate : null;
    } catch {
      return fail(400, "invalid_file", "Please send the photo as a form upload.");
    }

    if (!imageFile || imageFile.size === 0) {
      return fail(400, "invalid_file", "No photo was received. Please choose an image and try again.");
    }
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return fail(413, "invalid_file", "That photo is larger than 8 MB. Please choose a smaller image.");
    }

    const bytes = new Uint8Array(await imageFile.arrayBuffer());
    const mimeType = detectImageType(bytes);
    if (!mimeType) {
      return fail(415, "invalid_file", "That file is not a JPG, PNG, or WEBP image.");
    }

    const requestBody = JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: ANALYSIS_PROMPT }, { inline_data: { mime_type: mimeType, data: toBase64(bytes) } }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const geminiResponse = await callGeminiWithRetry(apiKey, requestBody);

    if (!geminiResponse.ok) {
      const status = geminiResponse.status;
      const detail = (await geminiResponse.text()).replaceAll(apiKey, "[redacted]").slice(0, 500);
      console.error(`Gemini error status=${status} model=${MODEL} endpoint=${GEMINI_URL} message=${detail}`);
      if (status === 429) {
        return fail(429, "quota_exceeded", "The free AI rate limit was reached. Wait a minute and try again. If it keeps happening, the free daily quota may be used up.");
      }
      if (status === 401 || status === 403 || (status === 400 && /api key/i.test(detail))) {
        return fail(500, "invalid_key", "The Gemini API key on the server was rejected. Check that it is correct.");
      }
      if (status === 404) {
        return fail(502, "server_error", "The AI model could not be found (404 NotFound). The site owner needs to check the model setting.");
      }
      if (status === 503) {
        return fail(503, "server_error", "The AI service is temporarily unavailable right now. Please wait a moment and try again.");
      }
      return fail(502, "server_error", "The AI service could not analyze this photo. Please try again.");
    }

    const text = extractModelText(await geminiResponse.json());
    let parsed: unknown = {};
    if (text.length > 0) {
      try {
        parsed = JSON.parse(text);
      } catch {
        console.error("Gemini returned non-JSON text");
        return fail(502, "server_error", "The AI service returned an unreadable result. Please try again.");
      }
    }

    const analysis = normalizeAnalysis(parsed);
    if (text.length === 0) {
      analysis.uncertainty_notes = [
        "The AI service did not return a result for this photo. Try a clearer, well-lit photo of the food.",
      ];
    }

    return json({ analysis });
  } catch (err) {
    const name = err instanceof Error ? err.name : "unknown";
    console.error("analyze-food failed", name);
    if (name === "TimeoutError" || name === "AbortError") {
      return fail(504, "timeout", "The AI took too long to analyze this photo. Please try again.");
    }
    return fail(502, "server_error", "Could not reach the AI service. Check your connection and try again.");
  }
});
