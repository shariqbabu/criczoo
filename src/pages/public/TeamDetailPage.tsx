import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useTeamWithPlayers } from '@/hooks/useTeamPlayer';
import { ArrowLeft, Users, User } from 'lucide-react';
import type { Player } from '@/types';

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { team, players, loading } = useTeamWithPlayers(teamId);

  if (loading) return <Layout><div className="max-w-4xl mx-auto px-4 py-8"><div className="shimmer h-48 rounded-xl" /></div></Layout>;

  if (!team) return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Team not found.</p>
        <Link to="/teams" className="text-primary hover:underline text-sm mt-2 inline-block">Browse Teams</Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/teams" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> All Teams
        </Link>

        {/* Team header */}
        <div className="bg-white rounded-2xl border border-border p-8 mb-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <Users className="w-10 h-10 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            {team.shortName && <p className="text-sm text-muted-foreground">{team.shortName}</p>}
            <p className="text-muted-foreground text-sm mt-1">{players.length} players</p>
            {team.description && <p className="text-sm mt-2">{team.description}</p>}
          </div>
        </div>

        {/* Players list */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-semibold mb-4">Squad</h2>
          {players.length === 0 ? (
            <p className="text-muted-foreground text-sm">No players added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((player: Player) => (
                <Link
                  key={player.id}
                  to={`/players/${player.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {player.photo ? (
                      <img src={player.photo} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{player.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{player.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
