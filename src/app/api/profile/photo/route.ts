import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getAuthOwner } from '@/lib/auth/session';
import { checkRateLimit, recordFailedAttempt } from '@/lib/auth/rateLimit';
import { 
  ensureAvatarDir, 
  saveUserAvatar, 
  removeUserAvatar, 
  getUserAvatarFilePath 
} from '@/lib/profile/db';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB raw limit
const MAX_UPLOADS_PER_HOUR = 10;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const owner = await getAuthOwner(req);

  if (owner.type !== 'user') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const filePath = getUserAvatarFilePath(owner.userId);
  if (!filePath || !fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'private, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to read avatar' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const owner = await getAuthOwner(req);

  if (owner.type !== 'user') {
    return NextResponse.json(
      { error: 'Authentication required. Profiles are available for signed-in accounts.' },
      { status: 401 }
    );
  }

  // Rate limiting per user
  const rateLimitKey = `avatar_upload:${owner.userId}`;
  const rateCheck = checkRateLimit(rateLimitKey, MAX_UPLOADS_PER_HOUR, ONE_HOUR_MS);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Too many photo uploads. Please try again in ${rateCheck.retryAfterSeconds || 60} seconds.` },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data upload.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: 'That file is too large. Choose one under 5 MB.' },
      { status: 400 }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Validate real image format via Sharp metadata inspection
    const metadata = await sharp(inputBuffer).metadata();
    const format = metadata.format?.toLowerCase();

    if (!format || !['jpeg', 'png', 'webp'].includes(format)) {
      return NextResponse.json(
        { error: 'Please choose a JPG, PNG or WebP image.' },
        { status: 400 }
      );
    }

    // Re-encode to fixed 512x512 WebP with stripped metadata
    const processedBuffer = await sharp(inputBuffer)
      .rotate() // Automatically respects EXIF orientation before stripping
      .resize(512, 512, { fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer();

    ensureAvatarDir();
    const randomFilename = `${crypto.randomUUID()}.webp`;
    const targetPath = path.join(ensureAvatarDir(), randomFilename);

    fs.writeFileSync(targetPath, processedBuffer);

    // Save avatar reference in db & increment version
    const { avatarVersion } = saveUserAvatar(owner.userId, randomFilename);

    // Record attempt for rate limiting
    recordFailedAttempt(rateLimitKey, ONE_HOUR_MS);

    return NextResponse.json({
      success: true,
      avatarVersion,
    });
  } catch (err: any) {
    console.error('Avatar upload/processing failed:', err);
    return NextResponse.json(
      { error: 'Failed to process image. Please try a different image.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const owner = await getAuthOwner(req);

  if (owner.type !== 'user') {
    return NextResponse.json(
      { error: 'Authentication required. Profiles are available for signed-in accounts.' },
      { status: 401 }
    );
  }

  const { avatarVersion } = removeUserAvatar(owner.userId);

  return NextResponse.json({
    success: true,
    avatarVersion,
  });
}
