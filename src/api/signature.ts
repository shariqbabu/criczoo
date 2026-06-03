import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../_lib/admin';
import crypto from 'crypto';

const ALLOWED_FOLDERS = ['team-logos', 'team-banners', 'player-photos', 'tournament-posters', 'avatars'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await verifyToken(req.headers.authorization);

    const { folder } = req.body;
    if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
      return res.status(400).json({ error: 'Invalid upload folder' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Cloudinary not configured' });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folderPath = `cricpro/${folder}`;

    const paramsToSign = `folder=${folderPath}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash('sha256')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    return res.status(200).json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder: folderPath,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return res.status(message === 'No token provided' ? 401 : 500).json({ error: message });
  }
}
