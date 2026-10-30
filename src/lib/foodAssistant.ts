import { FunctionError, postToFunction } from '@/lib/edgeFunctions';
import type { AnalysisResult, ChatMessage } from '@/types/food';

interface ChatResponse {
  answer: unknown;
}

export async function askFoodAssistant(
  question: string,
  analysis: AnalysisResult,
  history: ChatMessage[]
): Promise<string> {
  const payload = await postToFunction<ChatResponse>(
    'food-chat',
    JSON.stringify({
      question,
      analysis,
      history: history.map((message) => ({ role: message.role, text: message.text })),
    }),
    'application/json'
  );

  if (typeof payload.answer !== 'string' || payload.answer.trim().length === 0) {
    throw new FunctionError('server_error', 'The assistant returned an unreadable answer. Please try again.');
  }
  return payload.answer;
}
