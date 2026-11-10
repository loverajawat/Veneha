export type TranscriptionErrorCode = 
  | 'MISSING_API_KEY'
  | 'INVALID_API_KEY'
  | 'RATE_LIMIT'
  | 'MODEL_UNAVAILABLE'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNREADABLE_IMAGE'
  | 'PARSE_ERROR'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR';

export class TranscriptionError extends Error {
  code: TranscriptionErrorCode;
  userMessage: string;
  devMessage?: string;
  retryable: boolean;
  page?: number;

  constructor(options: {
    code: TranscriptionErrorCode;
    userMessage: string;
    devMessage?: string;
    retryable?: boolean;
    page?: number;
    cause?: any;
  }) {
    super(options.userMessage);
    this.name = 'TranscriptionError';
    this.code = options.code;
    this.userMessage = options.userMessage;
    this.devMessage = options.devMessage;
    this.retryable = options.retryable ?? false;
    this.page = options.page;
  }
}

export class MissingApiKeyError extends TranscriptionError {
  constructor(devDetail?: string) {
    super({
      code: 'MISSING_API_KEY',
      userMessage: "Reading your story isn't available right now. Please try again later.",
      devMessage: devDetail || 'No Gemini API key is configured on the server. Set GEMINI_API_KEY in .env.local or enter one in Settings.',
      retryable: false,
    });
    this.name = 'MissingApiKeyError';
  }
}

export class InvalidApiKeyError extends TranscriptionError {
  constructor(detail?: string) {
    super({
      code: 'INVALID_API_KEY',
      userMessage: 'The provided API key is invalid or unauthorized. Please verify your API key in Settings.',
      devMessage: detail,
      retryable: false,
    });
    this.name = 'InvalidApiKeyError';
  }
}

export class RateLimitError extends TranscriptionError {
  constructor() {
    super({
      code: 'RATE_LIMIT',
      userMessage: 'The AI service is experiencing high traffic. Please wait a moment and try again.',
      devMessage: 'Gemini API 429 quota or rate limit reached.',
      retryable: true,
    });
    this.name = 'RateLimitError';
  }
}

export class ModelUnavailableError extends TranscriptionError {
  constructor() {
    super({
      code: 'MODEL_UNAVAILABLE',
      userMessage: 'The AI transcription service is temporarily unavailable. Please retry in a moment.',
      devMessage: 'Gemini model service returned 503 or model temporarily unavailable.',
      retryable: true,
    });
    this.name = 'ModelUnavailableError';
  }
}

export class PayloadTooLargeError extends TranscriptionError {
  constructor() {
    super({
      code: 'PAYLOAD_TOO_LARGE',
      userMessage: 'The uploaded photos are too large to process. Please retake them or remove a page.',
      devMessage: 'Request payload exceeded maximum size limit.',
      retryable: false,
    });
    this.name = 'PayloadTooLargeError';
  }
}

export class UnreadableImageError extends TranscriptionError {
  constructor(page?: number, detail?: string) {
    super({
      code: 'UNREADABLE_IMAGE',
      userMessage: page 
        ? `Page ${page} could not be read clearly. Please retake the photo in better lighting or type your story.`
        : 'The uploaded photo could not be read clearly. Please retake in bright lighting or type your story.',
      devMessage: detail,
      page,
      retryable: true,
    });
    this.name = 'UnreadableImageError';
  }
}

export function mapToTranscriptionError(err: any): TranscriptionError {
  if (err instanceof TranscriptionError) {
    return err;
  }

  const msg = String(err?.message || err || '');
  const status = err?.status || err?.statusCode;

  if (status === 400 && (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid') || msg.includes('invalid api key'))) {
    return new InvalidApiKeyError(msg);
  }
  if (status === 403 || msg.includes('PERMISSION_DENIED') || msg.includes('unauthorized')) {
    return new InvalidApiKeyError(msg);
  }
  if (status === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('rate limit')) {
    return new RateLimitError();
  }
  if (status === 503 || status === 504 || msg.includes('UNAVAILABLE') || msg.includes('DEADLINE_EXCEEDED')) {
    return new ModelUnavailableError();
  }
  if (status === 413 || msg.includes('Payload Too Large') || msg.includes('Request Entity Too Large')) {
    return new PayloadTooLargeError();
  }
  if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('network')) {
    return new TranscriptionError({
      code: 'NETWORK_ERROR',
      userMessage: 'Network error communicating with AI service. Please check your connection and try again.',
      devMessage: msg,
      retryable: true,
    });
  }

  return new TranscriptionError({
    code: 'SERVER_ERROR',
    userMessage: "An error occurred while transcribing your story. Please retry or type your story.",
    devMessage: msg,
    retryable: true,
  });
}
