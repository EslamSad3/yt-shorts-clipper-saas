import { NextRequest, NextResponse } from 'next/server';
import { videoProcessor } from '@/lib/video-processor';
import { aiGenerator } from '@/lib/ai-generator';
import { captionService } from '@/lib/caption-service';
import { prisma } from '@/lib/db';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      videoUrl,
      startTime,
      endTime,
      captionStyle,
      generateAI = true
    } = body;

    // 1. Get video info
    const videoInfo = await videoProcessor.getVideoInfo(videoUrl);

    // 2. Create clip record
    const clip = await prisma.clip.create({
      data: {
        userId,
        sourceUrl: videoUrl,
        sourceTitle: videoInfo.title,
        videoDuration: videoInfo.duration,
        startTime,
        endTime,
        captionStyle,
        status: 'processing'
      }
    });

    // 3. Download video
    const videoPath = await videoProcessor.downloadVideo(videoUrl);

    // 4. Generate captions
    const captions = await captionService.generateCaptions(videoPath);
    const captionText = captions.map(c => c.text).join(' ');

    // 5. Process video clip
    const outputPath = path.join(process.cwd(), 'temp', `clip_${clip.id}.mp4`);
    await videoProcessor.createShortClip(videoPath, outputPath, {
      startTime,
      endTime,
      width: 1080,
      height: 1920,
      captionText: captionText.substring(0, 100),
      captionStyle
    });

    // 6. Generate AI metadata
    let aiMetadata;
    if (generateAI) {
      aiMetadata = await aiGenerator.generateMetadata(
        videoInfo.title,
        undefined,
        endTime - startTime
      );
    }

    // 7. Update clip with results
    const updatedClip = await prisma.clip.update({
      where: { id: clip.id },
      data: {
        status: 'completed',
        processedUrl: outputPath,
        captionText,
        aiHook: aiMetadata?.hook,
        aiTitle: aiMetadata?.title,
        aiDescription: aiMetadata?.description,
        aiTags: aiMetadata?.tags || []
      }
    });

    // 8. Cleanup original video
    await videoProcessor.cleanup(videoPath);

    return NextResponse.json({
      success: true,
      clip: updatedClip
    });
  } catch (error: any) {
    console.error('Video processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Video processing failed' },
      { status: 500 }
    );
  }
}
