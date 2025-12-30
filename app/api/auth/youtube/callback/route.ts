import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/youtube';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const userId = searchParams.get('state'); // Pass userId as state

  if (!code || !userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/error`);
  }

  try {
    const tokens = await getTokensFromCode(code);

    await prisma.user.update({
      where: { id: userId },
      data: {
        youtubeToken: tokens as any
      }
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?auth=success`);
  } catch (error) {
    console.error('YouTube auth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/error`);
  }
}
