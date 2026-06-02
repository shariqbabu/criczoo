import { adminDb } from './_lib/firebase-admin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ref = await adminDb.collection('tournaments').add({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      tournamentId: ref.id,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
