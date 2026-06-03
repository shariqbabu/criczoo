import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useTeams } from '@/hooks/useTeamPlayer';
import { Plus, Users, Edit } from 'lucide-react';

export default function ManageMatchPage() {
  const { teams, loading } = useTeams({ myTeams: true });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Matches</h1>
          <Link to="/host/matches/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Create Match
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="shimmer h-32 rounded-xl" />)}
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No teams yet</p>
            <Link to="/host/teams/create" className="text-primary hover:underline text-sm">Create your first team</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {teams.map(team => (
              <div key={team.id} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{team.name}</h3>
                      <p className="text-xs text-muted-foreground">{team.playerCount || 0} players</p>
                    </div>
                  </div>
                  <button className="p-1.5 hover:bg-muted rounded-md transition-colors">
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
