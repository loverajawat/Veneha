import { NextRequest, NextResponse } from 'next/server';
import { evaluatePPDTStory } from '@/lib/assessor/assessorService';
import { MissingApiKeyError } from '@/lib/transcriber/errors';

export const maxDuration = 60; // Allow sufficient time for deep assessment

// In-memory idempotency cache for active/recent request IDs
const activeRequests = new Map<string, Promise<any>>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      storyTranscript, 
      storyText,
      boxAndHeading,
      pictureId = 'ppdt-01',
      studentConcern,
      requestId 
    } = body;

    const targetStory = storyText || storyTranscript || '';
    if (!targetStory || targetStory.trim().length < 20) {
      return NextResponse.json(
        { error: 'A valid story transcript (at least 20 characters) is required for assessment.' },
        { status: 400 }
      );
    }

    const customKey = req.headers.get('x-gemini-key');

    // Idempotency guard: prevent duplicate parallel evaluations on rapid clicks
    const idKey = requestId || `${pictureId}-${targetStory.substring(0, 30)}`;
    if (activeRequests.has(idKey)) {
      const existingResult = await activeRequests.get(idKey);
      return NextResponse.json({
        success: true,
        feedback: existingResult,
      });
    }

    const evalPromise = evaluatePPDTStory({
      pictureId,
      confirmedStoryText: targetStory,
      boxAndHeading,
      studentConcern,
      customKey,
    });

    activeRequests.set(idKey, evalPromise);

    try {
      const feedback = await evalPromise;
      return NextResponse.json({
        success: true,
        feedback,
      });
    } finally {
      // Clear from active requests after completion
      setTimeout(() => activeRequests.delete(idKey), 5000);
    }
  } catch (error: any) {
    console.error('Assessment API error:', error.message);
    const status = error instanceof MissingApiKeyError ? 503 : 500;
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to complete story assessment' 
      },
      { status }
    );
  }
}
