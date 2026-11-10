import { NextResponse } from 'next/server';
import { getApiKey } from '@/lib/gemini';
import { TRANSCRIBER_CONFIG } from '@/lib/transcriber/config';

export async function GET() {
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) {
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }

  const key = getApiKey();
  const hasKey = Boolean(key && key.trim().length > 0);

  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    hasKey,
    model: TRANSCRIBER_CONFIG.MODEL_NAME,
    transcriber: process.env.TRANSCRIBER || 'gemini',
    passes: TRANSCRIBER_CONFIG.TRANSCRIBE_PASSES,
    demoModeAllowed: TRANSCRIBER_CONFIG.ALLOW_DEMO_MODE,
  });
}

