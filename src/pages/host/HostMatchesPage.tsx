import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useHostMatches } from '@/hooks/useMatch';
import { Plus, Activity, Edit, Radio } from 'lucide-react';

export default function HostMatchesPage() {
  const { matches, loading } = useHostMatches();

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
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-20 rounded-xl" />)}</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No matches yet</p>
            <Link to="/host/matches/create" className="text-primary hover:underline text-sm">Create your first match</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map(match => (
              <div key={match.id} className="bg-white rounded-xl border border-border p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{match.team1Name} vs {match.team2Name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      match.status === 'live' ? 'bg-red-100 text-red-600' :
                      match.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>{match.status}</span>
                    <span className="text-xs text-muted-foreground">{match.overs} overs</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {match.status === 'live' && (
                    <Link to={`/host/matches/${match.id}/score`} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                      <Radio className="w-3.5 h-3.5" /> Score
                    </Link>
                  )}
                  {match.status === 'upcoming' && (
                    <Link to={`/host/matches/${match.id}/edit`} className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
