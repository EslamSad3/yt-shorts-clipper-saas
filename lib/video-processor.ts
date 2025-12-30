import ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export interface ClipOptions {
  startTime: number;
  endTime: number;
  width?: number;
  height?: number;
  captionText?: string;
  captionStyle?: CaptionStyle;
}

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  position: 'top' | 'center' | 'bottom';
  animation?: 'fade' | 'slide' | 'none';
}

export class VideoProcessor {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async downloadVideo(videoUrl: string): Promise<string> {
    const videoId = ytdl.getVideoID(videoUrl);
    const outputPath = path.join(this.tempDir, `${videoId}_original.mp4`);

    return new Promise((resolve, reject) => {
      ytdl(videoUrl, { quality: 'highest' })
        .pipe(fs.createWriteStream(outputPath))
        .on('finish', () => resolve(outputPath))
        .on('error', reject);
    });
  }

  async createShortClip(
    inputPath: string,
    outputPath: string,
    options: ClipOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath)
        .setStartTime(options.startTime)
        .setDuration(options.endTime - options.startTime)
        .size(`${options.width || 1080}x${options.height || 1920}`)
        .aspect('9:16')
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-preset fast',
          '-crf 23',
          '-maxrate 5000k',
          '-bufsize 10000k',
          '-pix_fmt yuv420p',
          '-movflags +faststart'
        ]);

      // Add captions if provided
      if (options.captionText && options.captionStyle) {
        const captionFilter = this.generateCaptionFilter(
          options.captionText,
          options.captionStyle
        );
        command = command.videoFilters(captionFilter);
      }

      command
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  private generateCaptionFilter(text: string, style: CaptionStyle): string {
    const escapedText = text.replace(/'/g, "\\'").replace(/:/g, '\\:');
    const y = style.position === 'top' ? 100 : 
              style.position === 'bottom' ? 'h-th-100' : 
              '(h-th)/2';

    return `drawtext=text='${escapedText}':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:fontsize=${style.fontSize}:fontcolor=${style.fontColor}:box=1:boxcolor=${style.backgroundColor}:boxborderw=10:x=(w-text_w)/2:y=${y}`;
  }

  async getVideoInfo(videoUrl: string) {
    const info = await ytdl.getInfo(videoUrl);
    return {
      title: info.videoDetails.title,
      duration: parseInt(info.videoDetails.lengthSeconds),
      thumbnail: info.videoDetails.thumbnails[0].url,
      author: info.videoDetails.author.name
    };
  }

  async cleanup(filePath: string) {
    try {
      await unlink(filePath);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

export const videoProcessor = new VideoProcessor();
