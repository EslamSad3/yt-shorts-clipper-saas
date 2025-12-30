import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/youtube';

export async function GET(req: NextRequest) {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
