import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminDb, requireRole } from './_lib/admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await requireRole(req.headers.authorization, 'admin');
    const db = getAdminDb();

    const [usersSnap, matchesSnap, tournamentsSnap, teamsSnap, playersSnap, pendingAppsSnap] =
      await Promise.all([
        db.collection('users').count().get(),
        db.collection('matches').count().get(),
        db.collection('tournaments').count().get(),
        db.collection('teams').count().get(),
        db.collection('players').count().get(),
        db.collection('hostApplications').where('status', '==', 'pending').count().get(),
      ]);

    const [liveMatchesSnap, completedMatchesSnap, hostUsersSnap] = await Promise.all([
      db.collection('matches').where('status', '==', 'live').count().get(),
      db.collection('matches').where('status', '==', 'completed').count().get(),
      db.collection('users').where('role', '==', 'host').count().get(),
    ]);

    // Recent activity
    const recentMatchesSnap = await db.collection('matches')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const recentMatches = recentMatchesSnap.docs.map((d) => ({
      id: d.id,
      teamA: d.data().teamA?.name,
      teamB: d.data().teamB?.name,
      status: d.data().status,
      createdAt: d.data().createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        counts: {
          totalUsers: usersSnap.data().count,
          totalMatches: matchesSnap.data().count,
          totalTournaments: tournamentsSnap.data().count,
          totalTeams: teamsSnap.data().count,
          totalPlayers: playersSnap.data().count,
          pendingApplications: pendingAppsSnap.data().count,
          liveMatches: liveMatchesSnap.data().count,
          completedMatches: completedMatchesSnap.data().count,
          hostUsers: hostUsersSnap.data().count,
        },
        recentMatches,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
