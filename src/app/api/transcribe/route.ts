import { NextRequest, NextResponse } from 'next/server';
import { transcribeHandwrittenStory, StoryPageImage } from '@/lib/gemini';
import { MAX_STORY_PAGES } from '@/config/storyConfig';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_PAGE_BASE64_LENGTH = 12 * 1024 * 1024; // ~9MB per page raw size

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let pages: StoryPageImage[] = [];

    if (Array.isArray(body.pages)) {
      pages = body.pages;
    } else if (body.imageBase64) {
      pages = [{
        base64: body.imageBase64,
        mimeType: body.mimeType || 'image/jpeg',
      }];
    }

    if (pages.length === 0) {
      return NextResponse.json(
        { error: 'At least one page is required for transcription.' },
        { status: 400 }
      );
    }

    if (pages.length > MAX_STORY_PAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_STORY_PAGES} pages can be transcribed per story.` },
        { status: 400 }
      );
    }

    // Validate each page's data and type
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (!page.base64 || typeof page.base64 !== 'string') {
        return NextResponse.json(
          { error: `Page ${i + 1} is missing image data.` },
          { status: 400 }
        );
      }

      if (page.base64.length > MAX_PAGE_BASE64_LENGTH) {
        return NextResponse.json(
          { error: `Page ${i + 1} exceeds the maximum allowed file size.` },
          { status: 400 }
        );
      }

      const mime = page.mimeType?.toLowerCase() || 'image/jpeg';
      if (!ALLOWED_MIME_TYPES.includes(mime)) {
        return NextResponse.json(
          { error: `Page ${i + 1} has an unsupported format (${mime}). Allowed formats: JPEG, PNG, WebP.` },
          { status: 400 }
        );
      }
    }

    const customKey = req.headers.get('x-gemini-key');
    const transcript = await transcribeHandwrittenStory(pages, customKey);

    return NextResponse.json({
      success: true,
      transcript,
      message: `${pages.length} page${pages.length > 1 ? 's' : ''} transcribed successfully. Handwriting images discarded per privacy policy.`,
    });
  } catch (error: any) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe image(s)' },
      { status: 500 }
    );
  }
}
