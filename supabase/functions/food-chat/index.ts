const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL = "gemini-3.8-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const MAX_QUESTION_LENGTH = 300;
const MAX_HISTORY_ITEMS = 10;
const MAX_HISTORY_TEXT_LENGTH = 600;
const MAX_ANALYSIS_CHARS = 6000;

const SYSTEM_RULES = `You are the food assistant for Food Verse AI. Answer questions only about the meal described by the analysis below.
- The analysis is an estimate made from a photo. Say when something is uncertain and never present estimates as exact.
- If a question cannot be answered from the analysis, say what extra information or photo would help.
- Keep answers under 120 words and use plain language.
- Do not give medical advice. For medical conditions or allergies, suggest speaking with a qualified professional.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fail(status: number, code: string, message: string) {
  return json({ error: code, message }, status);
}

interface HistoryItem {
  role: "user" | "assistant";
  text: string;
}

function parseHistory(value: unknown): HistoryItem[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_HISTORY_ITEMS) return null;
  const items: HistoryItem[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return null;
    const { role, text } = item as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof text !== "string") return null;
    if (text.trim().length === 0 || text.length > MAX_HISTORY_TEXT_LENGTH) return null;
    items.push({ role, text: text.trim() });
  }
  return items;
}

function extractModelText(payload: unknown): string {
  const parts = (payload as { candidates?: { content?: { parts?: { text?: unknown; thought?: boolean }[] } }[] })
    ?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((part) => typeof part.text === "string" && part.thought !== true)
    .map((part) => part.text as string)
    .join("")
    .trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return fail(405, "invalid_input", "Use POST to ask a question.");
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return fail(500, "missing_key", "The Gemini API key is not set up on the server yet.");
    }

    let body: Record<string, unknown>;
    try {
      const parsed: unknown = await req.json();
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return fail(400, "invalid_input", "The question could not be read. Please try again.");
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return fail(400, "invalid_input", "The question could not be read. Please try again.");
    }

    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (question.length === 0 || question.length > MAX_QUESTION_LENGTH) {
      return fail(400, "invalid_input", `Questions must be between 1 and ${MAX_QUESTION_LENGTH} characters.`);
    }

    const analysis = body.analysis;
    if (typeof analysis !== "object" || analysis === null || !Array.isArray((analysis as { food_items?: unknown }).food_items)) {
      return fail(400, "invalid_input", "Analyze a meal photo before asking questions about it.");
    }
    const analysisText = JSON.stringify(analysis);
    if (analysisText.length > MAX_ANALYSIS_CHARS) {
      return fail(400, "invalid_input", "The meal analysis is too large to use as context.");
    }

    const history = parseHistory(body.history);
    if (history === null) {
      return fail(400, "invalid_input", "The conversation history could not be read.");
    }

    const geminiResponse = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SYSTEM_RULES}\n\nMeal analysis:\n${analysisText}` }] },
        contents: [
          ...history.map((item) => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.text }],
          })),
          { role: "user", parts: [{ text: question }] },
        ],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (!geminiResponse.ok) {
      const status = geminiResponse.status;
      if (status === 429) {
        return fail(429, "quota_exceeded", "The free AI quota has been used up for now. Please try again later.");
      }
      if (status === 401 || status === 403) {
        return fail(500, "invalid_key", "The Gemini API key on the server was rejected. Check that it is correct.");
      }
      console.error(`Gemini returned status ${status}`);
      return fail(502, "server_error", "The assistant could not answer right now. Please try again.");
    }

    const answer = extractModelText(await geminiResponse.json());
    if (answer.length === 0) {
      return fail(502, "server_error", "The assistant returned an empty answer. Please rephrase and try again.");
    }

    return json({ answer });
  } catch (err) {
    console.error("food-chat failed", err instanceof Error ? err.name : "unknown");
    return fail(502, "server_error", "Could not reach the assistant. Check your connection and try again.");
  }
});
