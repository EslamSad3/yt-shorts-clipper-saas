import { google, youtube_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ],
    prompt: 'consent'
  });
};

export const getTokensFromCode = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const refreshAccessToken = async (refreshToken: string) => {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
};

export const uploadVideoToYouTube = async (
  tokens: any,
  videoPath: string,
  metadata: {
    title: string;
    description: string;
    tags: string[];
    categoryId?: string;
    privacyStatus: 'public' | 'private' | 'unlisted';
  }
) => {
  oauth2Client.setCredentials(tokens);
  
  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
  });

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        categoryId: metadata.categoryId || '22', // People & Blogs
      },
      status: {
        privacyStatus: metadata.privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: require('fs').createReadStream(videoPath),
    },
  });

  return response.data;
};

export const getChannelInfo = async (tokens: any) => {
  oauth2Client.setCredentials(tokens);
  
  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
  });

  const response = await youtube.channels.list({
    part: ['snippet', 'statistics'],
    mine: true
  });

  return response.data.items?.[0];
};
