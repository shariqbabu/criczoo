import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { usePlayers } from '@/hooks/useTeamPlayer';
import { Plus, User } from 'lucide-react';

export default function ManagePlayersPage() {
  const { players, loading } = usePlayers({ myPlayers: true });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Players</h1>
          <Link to="/host/players/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Player
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="shimmer h-16 rounded-xl" />)}</div>
        ) : players.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No players yet</p>
            <Link to="/host/players/create" className="text-primary hover:underline text-sm">Add your first player</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Player</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Team</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Runs</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Wkts</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <tr key={player.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize hidden sm:table-cell">{player.role}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{player.teamName || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium">{player.stats?.totalRuns || 0}</td>
                    <td className="px-4 py-3 text-right font-medium hidden sm:table-cell">{player.stats?.totalWickets || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
