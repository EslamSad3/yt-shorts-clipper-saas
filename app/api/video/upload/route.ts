import { NextRequest, NextResponse } from 'next/server';
import { uploadVideoToYouTube } from '@/lib/youtube';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clipId, userId, title, description, tags, privacyStatus } = body;

    // Get user tokens
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.youtubeToken) {
      return NextResponse.json(
        { error: 'YouTube not connected' },
        { status: 401 }
      );
    }

    // Get clip
    const clip = await prisma.clip.findUnique({
      where: { id: clipId }
    });

    if (!clip?.processedUrl) {
      return NextResponse.json(
        { error: 'Clip not ready' },
        { status: 400 }
      );
    }

    // Create upload record
    const upload = await prisma.upload.create({
      data: {
        userId,
        clipId,
        status: 'uploading'
      }
    });

    // Upload to YouTube
    const youtubeResponse = await uploadVideoToYouTube(
      user.youtubeToken,
      clip.processedUrl,
      {
        title: title || clip.aiTitle || clip.sourceTitle,
        description: description || clip.aiDescription || '',
        tags: tags || clip.aiTags,
        privacyStatus: privacyStatus || 'public'
      }
    );

    // Update upload record
    const updatedUpload = await prisma.upload.update({
      where: { id: upload.id },
      data: {
        status: 'published',
        youtubeVideoId: youtubeResponse.id,
        youtubeUrl: `https://youtube.com/shorts/${youtubeResponse.id}`,
        publishedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      upload: updatedUpload
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
