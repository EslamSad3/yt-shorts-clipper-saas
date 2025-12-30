# 🎬 YouTube Shorts Clipper SaaS

AI-powered platform to automatically create, optimize, and upload YouTube Shorts from long-form videos.

## ✨ Features

- 📹 **Video Download**: Download YouTube videos using ytdl-core
- ✂️ **Smart Clipping**: Clip videos to perfect 9:16 Shorts format with FFmpeg
- 📝 **Auto Captions**: Generate captions using OpenAI Whisper AI
- 🤖 **AI Metadata**: Gemini 2.0 Flash generates viral hooks, titles, descriptions, and tags
- 📤 **Auto Upload**: Direct upload to YouTube with OAuth2
- 💼 **Multi-tenant**: Built for SaaS with Prisma + PostgreSQL
- 🔐 **Whop Integration**: Ready for Whop marketplace

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Video Processing**: FFmpeg + ytdl-core
- **AI Services**: 
  - Gemini 2.0 Flash (metadata generation)
  - OpenAI Whisper (caption generation)
- **APIs**: YouTube Data API v3
- **Auth**: YouTube OAuth2
- **UI**: Radix UI + Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- FFmpeg installed on system
- Google Cloud Project with YouTube Data API enabled
- OpenAI API key
- Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/EslamSad3/yt-shorts-clipper-saas.git
cd yt-shorts-clipper-saas
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- Database URL
- YouTube OAuth credentials
- Gemini API key
- OpenAI API key

4. Setup database:
```bash
npx prisma db push
```

5. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Setup YouTube API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **YouTube Data API v3**
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/youtube/callback`
5. Copy Client ID and Client Secret to `.env`

## 🔑 Get API Keys

- **Gemini API**: [ai.google.dev](https://ai.google.dev)
- **OpenAI API**: [platform.openai.com](https://platform.openai.com)
- **Whop API**: [whop.com/developers](https://whop.com/developers)

## 📁 Project Structure

```
yt-shorts-clipper-saas/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Main dashboard
│   └── layout.tsx
├── components/           # React components
├── lib/
│   ├── youtube.ts       # YouTube API integration
│   ├── video-processor.ts  # FFmpeg processing
│   ├── ai-generator.ts  # Gemini AI
│   ├── caption-service.ts  # Whisper captions
│   └── db.ts            # Prisma client
├── prisma/
│   └── schema.prisma    # Database schema
└── package.json
```

## 🎯 Usage

1. **Connect YouTube Account**: Authenticate with YouTube OAuth
2. **Paste Video URL**: Enter any YouTube video URL
3. **Select Clip Range**: Choose start and end time (max 60s for Shorts)
4. **Customize Captions**: Select caption style and positioning
5. **Generate AI Metadata**: Auto-generate hooks, titles, descriptions, tags
6. **Upload to YouTube**: One-click upload as YouTube Short

## 🔧 Configuration

### Caption Styles

Customize caption appearance in `lib/video-processor.ts`:
- Font family, size, color
- Background color
- Position (top, center, bottom)
- Animation effects

### AI Prompts

Modify AI generation prompts in `lib/ai-generator.ts` to match your brand voice.

## 📊 Database Schema

- **User**: User accounts with YouTube tokens
- **Clip**: Processed video clips
- **Upload**: YouTube upload tracking with analytics

## 🚢 Deployment

### Vercel (Recommended for Frontend)

```bash
vercel deploy
```

### Backend Processing

For video processing, use:
- **Render.com** (API hosting)
- **Railway.app** (Full-stack)
- **AWS Lambda** (Serverless)

### Database

- **Neon**: Serverless PostgreSQL
- **Supabase**: PostgreSQL + Storage
- **PlanetScale**: MySQL alternative

## 💰 Monetization (Whop)

This platform is ready for Whop marketplace:
1. Create Whop product
2. Add webhook endpoint: `/api/whop/webhook`
3. Implement subscription tiers:
   - Free: 5 clips/month
   - Pro: 50 clips/month
   - Enterprise: Unlimited

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📄 License

MIT License - see LICENSE file

## 🙏 Credits

Built by [Eslam Saad](https://github.com/EslamSad3)

## 🐛 Known Issues

- ytdl-core may need updates for YouTube changes
- FFmpeg must be installed on hosting server
- Large videos may timeout (use queue system)

## 🔮 Roadmap

- [ ] Batch processing multiple clips
- [ ] Advanced caption animations
- [ ] TikTok/Instagram Reels upload
- [ ] Video templates library
- [ ] Analytics dashboard
- [ ] Team collaboration features

## 📞 Support

Open an issue or contact: [GitHub Issues](https://github.com/EslamSad3/yt-shorts-clipper-saas/issues)

---

⭐ Star this repo if you find it helpful!
