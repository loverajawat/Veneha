import { NextRequest, NextResponse } from 'next/server';
import { transcribeHandwrittenStory } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image data is required for transcription' },
        { status: 400 }
      );
    }

    const customKey = req.headers.get('x-gemini-key');
    const transcript = await transcribeHandwrittenStory(
      imageBase64,
      mimeType || 'image/jpeg',
      customKey
    );

    return NextResponse.json({
      success: true,
      transcript,
      message: 'Photo transcribed successfully. Handwriting image discarded per privacy policy.',
    });
  } catch (error: any) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe image' },
      { status: 500 }
    );
  }
}

