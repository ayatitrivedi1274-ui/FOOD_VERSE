export type FunctionErrorCode =
  | 'missing_key'
  | 'invalid_key'
  | 'quota_exceeded'
  | 'invalid_file'
  | 'invalid_input'
  | 'server_error'
  | 'timeout'
  | 'network';

const KNOWN_CODES: FunctionErrorCode[] = [
  'missing_key',
  'invalid_key',
  'quota_exceeded',
  'invalid_file',
  'invalid_input',
  'server_error',
  'timeout',
];

const REQUEST_TIMEOUT_MS = 120_000;

export class FunctionError extends Error {
  readonly code: FunctionErrorCode;

  constructor(code: FunctionErrorCode, message: string) {
    super(message);
    this.name = 'FunctionError';
    this.code = code;
  }
}

const FUNCTIONS_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Calls a server function and returns its JSON body. Failures become FunctionError with a code the UI can explain.
export async function postToFunction<T>(slug: string, body: BodyInit, contentType?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${FUNCTIONS_BASE_URL}/${slug}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ANON_KEY}`,
        apikey: ANON_KEY,
        ...(contentType ? { 'Content-Type': contentType } : {}),
      },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new FunctionError('timeout', 'The AI took too long to respond. Please try again.');
    }
    throw new FunctionError('network', 'Could not reach the analysis service. Check your connection and try again.');
  }

  const payload: unknown = await response.json().catch(() => null);
  const record = (typeof payload === 'object' && payload !== null ? payload : {}) as Record<string, unknown>;

  if (!response.ok) {
    const code = KNOWN_CODES.find((known) => known === record.error) ?? 'server_error';
    const message =
      typeof record.message === 'string' ? record.message : 'Something went wrong on our server. Please try again.';
    throw new FunctionError(code, message);
  }

  if (payload === null) {
    throw new FunctionError('server_error', 'The server sent an unreadable response. Please try again.');
  }
  return payload as T;
}
