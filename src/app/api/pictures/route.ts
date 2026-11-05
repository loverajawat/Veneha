import { NextRequest, NextResponse } from 'next/server';
import { PPDT_PICTURES } from '@/data/pictures';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const excludeId = searchParams.get('exclude');

  let available = PPDT_PICTURES.filter(p => p.active);
  if (excludeId && available.length > 1) {
    available = available.filter(p => p.id !== excludeId);
  }

  const randomPick = available[Math.floor(Math.random() * available.length)] || PPDT_PICTURES[0];

  return NextResponse.json({
    total: PPDT_PICTURES.length,
    random: randomPick,
    all: PPDT_PICTURES.slice(0, 20), // preview
  });
}

