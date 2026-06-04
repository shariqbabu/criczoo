import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useMyTeams } from '@/hooks/useTeamPlayer';
import { Plus, Shield } from 'lucide-react';

export default function ManageTeamsPage() {
  const { data: teams = [], isLoading } = useMyTeams();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Teams</h1>
          <Link to="/host/teams/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Create Team
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-20 rounded-xl" />)}</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No teams yet</p>
            <Link to="/host/teams/create" className="text-primary hover:underline text-sm">Create your first team</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <div key={team.id} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {team.shortName?.slice(0, 2) || team.name?.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{team.name}</h3>
                    <p className="text-xs text-muted-foreground">{team.city || 'No city'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-border pt-3">
                  <div>
                    <p className="font-bold text-base">{team.stats?.matchesPlayed ?? 0}</p>
                    <p className="text-muted-foreground">Played</p>
                  </div>
                  <div>
                    <p className="font-bold text-base text-green-600">{team.stats?.won ?? 0}</p>
                    <p className="text-muted-foreground">Won</p>
                  </div>
                  <div>
                    <p className="font-bold text-base text-red-500">{team.stats?.lost ?? 0}</p>
                    <p className="text-muted-foreground">Lost</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
