import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface Caption {
  text: string;
  start: number;
  end: number;
}

export class CaptionService {
  async generateCaptions(audioPath: string): Promise<Caption[]> {
    const audioFile = fs.createReadStream(audioPath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word']
    });

    // Convert to caption format with timing
    const captions: Caption[] = [];
    
    if (transcription.words) {
      let currentCaption = '';
      let startTime = 0;
      let wordCount = 0;

      for (const word of transcription.words) {
        if (wordCount === 0) {
          startTime = word.start;
        }

        currentCaption += word.word + ' ';
        wordCount++;

        // Create caption every 3-5 words or at punctuation
        if (wordCount >= 4 || this.endsWithPunctuation(word.word)) {
          captions.push({
            text: currentCaption.trim(),
            start: startTime,
            end: word.end
          });
          currentCaption = '';
          wordCount = 0;
        }
      }

      // Add remaining words
      if (currentCaption) {
        const lastWord = transcription.words[transcription.words.length - 1];
        captions.push({
          text: currentCaption.trim(),
          start: startTime,
          end: lastWord.end
        });
      }
    }

    return captions;
  }

  private endsWithPunctuation(word: string): boolean {
    return /[.!?,;:]$/.test(word);
  }

  formatCaptionsAsSRT(captions: Caption[]): string {
    return captions.map((caption, index) => {
      const startTime = this.formatTimestamp(caption.start);
      const endTime = this.formatTimestamp(caption.end);
      
      return `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n`;
    }).join('\n');
  }

  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }
}

export const captionService = new CaptionService();
