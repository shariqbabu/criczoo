import { adminDb } from './_lib/firebase-admin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    const ref = await adminDb.collection('matches').add({
      ...data,
      status: 'upcoming',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      matchId: ref.id,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
