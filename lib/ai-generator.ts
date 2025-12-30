import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AIMetadata {
  hook: string;
  title: string;
  description: string;
  tags: string[];
}

export class AIMetadataGenerator {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async generateMetadata(
    videoTitle: string,
    videoDescription?: string,
    clipDuration?: number
  ): Promise<AIMetadata> {
    const prompt = `
You are an expert YouTube Shorts content strategist. Generate compelling metadata for a YouTube Short.

Original Video Title: ${videoTitle}
${videoDescription ? `Description: ${videoDescription}` : ''}
${clipDuration ? `Clip Duration: ${clipDuration} seconds` : ''}

Generate the following in JSON format:
1. "hook": A captivating 5-7 word hook that appears at the start (attention-grabbing, creates curiosity)
2. "title": An optimized YouTube Shorts title (40-60 characters, includes relevant keywords, creates FOMO)
3. "description": A 150-200 character description with relevant hashtags (3-5 hashtags, includes #Shorts)
4. "tags": An array of 10-15 relevant tags for YouTube SEO

Make it viral-worthy, trending, and optimized for the YouTube algorithm.

Return ONLY valid JSON, no markdown formatting.
`;

    const result = await this.model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean up markdown code blocks if present
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const metadata = JSON.parse(cleanedText);
      return metadata;
    } catch (error) {
      console.error('Failed to parse AI response:', text);
      throw new Error('Invalid AI response format');
    }
  }

  async generateMultipleVariations(
    videoTitle: string,
    count: number = 3
  ): Promise<AIMetadata[]> {
    const variations: AIMetadata[] = [];
    
    for (let i = 0; i < count; i++) {
      const metadata = await this.generateMetadata(videoTitle);
      variations.push(metadata);
    }
    
    return variations;
  }
}

export const aiGenerator = new AIMetadataGenerator();
