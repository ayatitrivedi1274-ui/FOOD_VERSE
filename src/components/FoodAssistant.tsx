import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, Info, Loader2, Lock, Send, User } from 'lucide-react';
import { askFoodAssistant } from '@/lib/foodAssistant';
import { FunctionError } from '@/lib/edgeFunctions';
import { validateQuestion } from '@/lib/validation';
import type { ChatMessage, FoodAnalysis } from '@/types/food';

interface FoodAssistantProps {
  analysis: FoodAnalysis | null;
}

const SUGGESTED_QUESTIONS = ['How much protein is in this?', 'Is this meal vegetarian?', 'Suggest a lighter swap'];
const MAX_HISTORY_MESSAGES = 10;

export default function FoodAssistant({ analysis }: FoodAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(0);

  const canChat = analysis !== null && analysis.source === 'ai';

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, isThinking]);

  const sendQuestion = async (text: string) => {
    if (!analysis || analysis.source !== 'ai') return;

    const validationError = validateQuestion(text);
    if (validationError) {
      setInputError(validationError);
      return;
    }

    const trimmed = text.trim();
    const history = messages.filter((message) => !message.isError).slice(-MAX_HISTORY_MESSAGES);
    setMessages((current) => [...current, { id: `m-${nextIdRef.current++}`, role: 'user', text: trimmed }]);
    setQuestion('');
    setInputError(null);
    setIsThinking(true);

    try {
      const reply = await askFoodAssistant(trimmed, analysis.result, history);
      setMessages((current) => [...current, { id: `m-${nextIdRef.current++}`, role: 'assistant', text: reply }]);
    } catch (error) {
      const message =
        error instanceof FunctionError
          ? error.message
          : 'Sorry, I could not answer that right now. Please try again in a moment.';
      setMessages((current) => [
        ...current,
        { id: `m-${nextIdRef.current++}`, role: 'assistant', text: message, isError: true },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isThinking || !canChat) return;
    void sendQuestion(question);
  };

  return (
    <div className="flex flex-col rounded-3xl border border-cream-300 bg-cream-50 shadow-card">
      <div className="flex items-start gap-3 border-b border-cream-300 px-5 py-4 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf-600 text-cream-50">
          <Bot className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-ink-900">Food assistant</h2>
          <p className="text-xs text-ink-500">Answers use the result of your latest photo analysis.</p>
        </div>
      </div>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation with the food assistant"
        className="flex h-80 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6"
      >
        {!canChat && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-200 text-ink-700">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="max-w-xs text-sm text-ink-600">
              {analysis?.source === 'demo'
                ? 'Chat works with a real photo. Upload and analyze your meal to start asking questions.'
                : 'Analyze a meal photo first. Then ask anything about its portion, nutrition, or ingredients.'}
            </p>
          </div>
        )}

        {canChat && messages.length === 0 && (
          <ChatBubble
            message={{
              id: 'greeting',
              role: 'assistant',
              text: 'Ask me about the portion, the ingredients, or a healthier swap for this meal.',
            }}
          />
        )}
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {isThinking && (
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <Loader2 className="h-4 w-4 animate-spin text-leaf-600" aria-hidden="true" />
            Thinking...
          </div>
        )}
      </div>

      {canChat && messages.length === 0 && (
        <div className="flex flex-wrap gap-2 px-5 pb-2 sm:px-6">
          {SUGGESTED_QUESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void sendQuestion(suggestion)}
              disabled={isThinking}
              className="rounded-full border border-leaf-200 bg-leaf-50 px-3.5 py-1.5 text-sm font-medium text-leaf-800 transition-colors hover:bg-leaf-100 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="border-t border-cream-300 px-5 py-4 sm:px-6">
        <label htmlFor="assistant-question" className="sr-only">
          Ask a question about your meal
        </label>
        <div className="flex items-center gap-2">
          <input
            id="assistant-question"
            type="text"
            value={question}
            disabled={!canChat}
            onChange={(event) => {
              setQuestion(event.target.value);
              if (inputError) setInputError(null);
            }}
            placeholder={canChat ? 'Ask about protein, portions, or swaps...' : 'Analyze a photo to unlock the chat'}
            aria-invalid={inputError ? true : undefined}
            aria-describedby={inputError ? 'assistant-question-error' : undefined}
            className="min-w-0 flex-1 rounded-full border border-cream-300 bg-cream-100 px-5 py-3 text-sm text-ink-900 placeholder:text-ink-500 transition-colors focus:border-leaf-500 focus:bg-cream-50 focus:outline-none focus:ring-2 focus:ring-leaf-200 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isThinking || !canChat}
            aria-label="Send question"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-leaf-600 text-cream-50 transition-colors hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-leaf-200 disabled:text-leaf-800"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {inputError && (
          <p id="assistant-question-error" role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-berry-700">
            <Info className="h-4 w-4" aria-hidden="true" />
            {inputError}
          </p>
        )}
      </form>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-end gap-2.5 animate-fade-up ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-apricot-100 text-apricot-700' : 'bg-leaf-100 text-leaf-700'
        }`}
      >
        {isUser ? <User className="h-4 w-4" aria-hidden="true" /> : <Bot className="h-4 w-4" aria-hidden="true" />}
      </span>
      <p
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-leaf-600 text-cream-50'
            : message.isError
              ? 'rounded-bl-md border border-berry-500/30 bg-berry-50 text-berry-700'
              : 'rounded-bl-md border border-cream-300 bg-cream-100 text-ink-900'
        }`}
      >
        {message.text}
      </p>
    </div>
  );
}
