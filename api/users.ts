import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminDb, requireRole } from './_lib/admin';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return getUsers(req, res);
  if (req.method === 'PUT') return updateUserRole(req, res);
  return res.status(405).json({ error: 'Method not allowed' });
}

async function getUsers(req: VercelRequest, res: VercelResponse) {
  try {
    await requireRole(req.headers.authorization, 'admin');
    const db = getAdminDb();

    const page = parseInt(String(req.query.page || '1'));
    const pageSize = 20;

    const snap = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    const users = snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        name: data.name,
        username: data.username,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt,
        emailVerified: data.emailVerified,
      };
    });

    return res.status(200).json({ success: true, data: users, page });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}

const RoleUpdateSchema = z.object({
  role: z.enum(['user', 'host', 'admin']),
});

async function updateUserRole(req: VercelRequest, res: VercelResponse) {
  try {
    await requireRole(req.headers.authorization, 'admin');
    const db = getAdminDb();

    const uid = req.url?.match(/\/admin\/users\/([^/]+)\/role/)?.[1];
    if (!uid) return res.status(400).json({ error: 'User ID required' });

    const parsed = RoleUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid role' });

    await db.collection('users').doc(uid).update({
      role: parsed.data.role,
      updatedAt: new Date(),
    });

    return res.status(200).json({ success: true, message: 'Role updated' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
