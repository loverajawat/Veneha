import { NextRequest, NextResponse } from 'next/server';
import { MAX_STORY_PAGES } from '@/config/storyConfig';
import { getTranscriber } from '@/lib/transcriber';
import { PageImageInput } from '@/lib/transcriber/types';
import { TranscriptionError } from '@/lib/transcriber/errors';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_PAGE_BASE64_LENGTH = 15 * 1024 * 1024; // ~11MB per page raw size

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let pages: PageImageInput[] = [];

    if (Array.isArray(body.pages)) {
      pages = body.pages.map((p: any, idx: number) => ({
        base64: p.base64,
        mimeType: p.mimeType || 'image/jpeg',
        pageNumber: idx + 1,
      }));
    } else if (body.imageBase64) {
      pages = [{
        base64: body.imageBase64,
        mimeType: body.mimeType || 'image/jpeg',
        pageNumber: 1,
      }];
    }

    if (pages.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one page is required for transcription.',
          code: 'UNREADABLE_IMAGE',
          retryable: false
        },
        { status: 400 }
      );
    }

    if (pages.length > MAX_STORY_PAGES) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Maximum ${MAX_STORY_PAGES} pages can be transcribed per story.`,
          code: 'PAYLOAD_TOO_LARGE',
          retryable: false
        },
        { status: 400 }
      );
    }

    // Validate each page's data and type
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (!page.base64 || typeof page.base64 !== 'string') {
        return NextResponse.json(
          { 
            success: false, 
            error: `Page ${i + 1} is missing image data.`,
            code: 'UNREADABLE_IMAGE',
            retryable: false
          },
          { status: 400 }
        );
      }

      if (page.base64.length > MAX_PAGE_BASE64_LENGTH) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Page ${i + 1} exceeds the maximum allowed file size.`,
            code: 'PAYLOAD_TOO_LARGE',
            retryable: false
          },
          { status: 400 }
        );
      }

      const mime = page.mimeType?.toLowerCase() || 'image/jpeg';
      if (!ALLOWED_MIME_TYPES.includes(mime)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Page ${i + 1} has an unsupported format (${mime}). Allowed formats: JPEG, PNG, WebP.`,
            code: 'UNREADABLE_IMAGE',
            retryable: false
          },
          { status: 400 }
        );
      }
    }

    const customKey = req.headers.get('x-gemini-key');
    const transcriber = getTranscriber();
    const result = await transcriber.transcribe(pages, customKey);

    return NextResponse.json({
      success: true,
      transcript: result.combined_transcript,
      story_text: result.story_text,
      box_and_heading: result.box_and_heading,
      pages: result.pages,
      total_unclear_count: result.total_unclear_count,
      isDemo: result.isDemo ?? false,
      message: `${pages.length} page${pages.length > 1 ? 's' : ''} transcribed successfully. Photos discarded per privacy policy.`,
    });
  } catch (error: any) {
    console.error('Transcription API error:', error);
    const isDev = process.env.NODE_ENV === 'development';

    let status = 500;
    let code = 'SERVER_ERROR';
    let userMessage = "Reading your story isn't available right now. Please try again later.";
    let devMessage = error.message;
    let retryable = false;

    if (error instanceof TranscriptionError) {
      userMessage = error.userMessage;
      code = error.code;
      devMessage = error.devMessage || error.message;
      retryable = error.retryable;

      switch (error.code) {
        case 'MISSING_API_KEY':
          status = 503;
          break;
        case 'INVALID_API_KEY':
          status = 401;
          break;
        case 'RATE_LIMIT':
          status = 429;
          break;
        case 'PAYLOAD_TOO_LARGE':
          status = 413;
          break;
        case 'UNREADABLE_IMAGE':
          status = 422;
          break;
        case 'MODEL_UNAVAILABLE':
          status = 503;
          break;
        default:
          status = 500;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        code,
        retryable,
        ...(isDev ? { devDetail: devMessage } : {}),
      },
      { status }
    );
  }
}
