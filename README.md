# Food Verse AI

Upload a photo of a meal and get an AI-powered estimate of the foods it contains, their likely ingredients, portion size, calories, and macronutrients. Ask follow-up questions about the meal in the built-in food assistant.

All nutrition values are estimates based on the photo. They are not exact measurements and should not be used for medical decisions.

## How it works

- The browser sends your photo to a server function (`supabase/functions/analyze-food`).
- The server checks the file type and size, then sends the photo and an instruction to Google's Gemini model (`gemini-3.8-flash`, Google's current Flash model for new projects).
- The model returns structured JSON, which the server checks and passes to the results dashboard.
- The food assistant sends your question plus the current analysis to a second server function (`supabase/functions/food-chat`).
- Photos and chat history are never stored. They exist only in memory while you use the page.

## Setup: add your Gemini API key

The key is a secret. It must only live on the server, never in the website's code.

1. Create a free key at Google AI Studio: https://aistudio.google.com/app/apikey
   Sign in with a Google account and choose "Create API key". Do not enable billing.
2. In Bolt, click the **database icon** at the top center of the screen, then click **Secrets**.
3. In **Name**, type exactly `GEMINI_API_KEY`.
4. In **Value**, paste your key and click **Create secret**.

The secret is available to the server functions right away. No redeploy is needed.

For local tools, copy `.env.example` to `.env` and paste the key after `GEMINI_API_KEY=`. The `.env` file is excluded from Git, so the key is not committed.

## Testing with a real photo

1. Open the app preview and scroll to **Analyze your plate**.
2. Click **Drop a photo here or browse** and choose a JPG, PNG, or WEBP photo under 8 MB.
3. Click **Analyze Food**. You should see the loading skeleton, then the foods, calories, macros, ingredients, uncertainty notes, and suggestions.
4. Scroll to **Ask about your meal** and ask, for example, "How much protein is in this?" The answer should reference your photo.
5. Try the error states:
   - Upload a `.gif` or `.txt` file: you should see a "not supported" message before anything is sent.
   - Remove the secret and analyze again: you should see "Analysis is not set up yet".
   - Use a photo with no food (a wall or a car): you should see the "No food identified" state.
   - Exceeding the free quota shows "Free AI quota reached".

## Troubleshooting

- **"The AI service could not analyze this photo"**: usually a temporary problem on Google's side. Wait a minute and click **Analyze Food** again. If it keeps happening, try a smaller JPG or PNG.
- **"The AI model is temporarily unavailable"**: Google has retired or renamed the model the site uses. The site owner needs to update the model name in `supabase/functions/analyze-food/index.ts` and `supabase/functions/food-chat/index.ts`, then redeploy. Google publishes current model names on its Gemini models page.
- **"Analysis is not set up yet"**: the `GEMINI_API_KEY` secret is missing or was rejected. Re-add it in Bolt Secrets with the exact name `GEMINI_API_KEY`.
- **"The AI took too long"**: Google's model was slow on that request. Wait a moment and try again. Smaller photos are faster.
- **"The AI service is busy right now"**: Google is temporarily overloaded. Wait a minute and try again.
- **"Could not reach the AI service"**: check your internet connection, then try again.

## Free tier limits

The Gemini free tier has daily and per-minute request limits that Google can change. If you hit them, the app shows a quota message. Wait a while and try again. Free-tier availability also depends on your region.

## Security notes

- The `GEMINI_API_KEY` is read only by the server functions and is never sent to the browser.
- Server functions require the site's public key, so casual visitors cannot call them directly without the site. Anyone who can open the site can still use your Gemini quota, so keep an eye on usage in Google AI Studio.
- Uploads are checked on the browser and again on the server. The server reads the real file signature, not just the file name.

## Project structure

- `supabase/functions/analyze-food/index.ts`: receives the photo, validates it, calls Gemini, and returns structured results.
- `supabase/functions/food-chat/index.ts`: answers follow-up questions using the current analysis as context.
- `src/lib/foodAnalysis.ts`: frontend request for photo analysis.
- `src/lib/foodAssistant.ts`: frontend request for chat answers.
- `src/lib/edgeFunctions.ts`: shared request helper and error codes.
- `src/hooks/useFoodAnalysis.ts`: loading, success, and error state for the analysis.
- `src/components/FoodUploader.tsx`: photo upload, preview, and Analyze button.
- `src/components/AnalysisDashboard.tsx`: results cards and states.
- `src/components/FoodAssistant.tsx`: chat interface.
- `.env.example`: lists the secret name without a value.

## Development

- Install: `npm install`
- Build check: `npm run build`
- Type check: `npm run typecheck`
