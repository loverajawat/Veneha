import { NextRequest, NextResponse } from 'next/server';
import { assessPPDTStory } from '@/lib/gemini';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storyTranscript, picturePath } = body;

    if (!storyTranscript || storyTranscript.trim().length < 15) {
      return NextResponse.json(
        { error: 'A valid story transcript (at least 15 characters) is required for assessment.' },
        { status: 400 }
      );
    }

    let stimulusBase64: string | null = null;
    let stimulusMimeType: string | null = null;

    if (picturePath) {
      try {
        // e.g. picturePath = "/pictures/ppdt_stimulus_01.jpg"
        const cleanPath = picturePath.startsWith('/') ? picturePath.slice(1) : picturePath;
        const fullLocalPath = path.join(process.cwd(), 'public', cleanPath);
        if (fs.existsSync(fullLocalPath)) {
          const fileBuffer = fs.readFileSync(fullLocalPath);
          stimulusBase64 = fileBuffer.toString('base64');
          stimulusMimeType = cleanPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
        }
      } catch (err) {
        console.warn('Could not read stimulus image from disk:', err);
      }
    }

    const customKey = req.headers.get('x-gemini-key');
    const feedback = await assessPPDTStory(
      storyTranscript,
      stimulusBase64,
      stimulusMimeType,
      customKey
    );

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error: any) {
    console.error('Assessment API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete story assessment' },
      { status: 500 }
    );
  }
}

