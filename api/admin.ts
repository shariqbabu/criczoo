import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App;

function getAdminApp(): App {
  if (!adminApp) {
    const apps = getApps();
    if (apps.length > 0) {
      adminApp = apps[0];
    } else {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }
  return adminApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export async function verifyToken(token: string | undefined) {
  if (!token) throw new Error('No token provided');
  const cleanToken = token.replace('Bearer ', '');
  return getAdminAuth().verifyIdToken(cleanToken);
}

export async function requireRole(token: string | undefined, requiredRole: string) {
  const decoded = await verifyToken(token);
  const db = getAdminDb();
  const userDoc = await db.collection('users').doc(decoded.uid).get();

  if (!userDoc.exists) throw new Error('User not found');

  const userData = userDoc.data();
  const userRole = userData?.role || 'user';

  const roleHierarchy: Record<string, number> = { user: 0, host: 1, admin: 2 };
  if ((roleHierarchy[userRole] ?? 0) < (roleHierarchy[requiredRole] ?? 0)) {
    throw new Error(`Requires ${requiredRole} role`);
  }

  return { decoded, userData, role: userRole };
}
