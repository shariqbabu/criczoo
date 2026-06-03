import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { getHostTournaments } from '@/services/tournamentService';
import { Plus, Trophy, Calendar } from 'lucide-react';
import type { Tournament } from '@/types';

export default function HostTournamentsPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getHostTournaments(user.uid)
      .then(setTournaments)
      .finally(() => setLoading(false));
  }, [user]);

  const statusColor = (s: string) =>
    s === 'ongoing' ? 'bg-green-100 text-green-700' :
    s === 'completed' ? 'bg-gray-100 text-gray-600' :
    'bg-blue-100 text-blue-700';

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Tournaments</h1>
          <Link to="/host/tournaments/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Create Tournament
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-24 rounded-xl" />)}</div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No tournaments yet</p>
            <Link to="/host/tournaments/create" className="text-primary hover:underline text-sm">
              Create your first tournament
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-border p-5 flex items-center justify-between hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(t.status)}`}>
                        {t.status}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(t.startDate).toLocaleDateString('en-IN')}
                      </span>
                      <span className="text-xs text-muted-foreground">{t.teams?.length ?? 0} teams</span>
                    </div>
                  </div>
                </div>
                <Link to={`/tournaments/${t.id}`}
                  className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
