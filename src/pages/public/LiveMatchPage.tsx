import Layout from '@/components/common/Layout';
import { useMatches } from '@/hooks/useMatch';
import { Link } from 'react-router-dom';
import { Radio, Clock, Users } from 'lucide-react';

export default function LiveMatchesPage() {
  const { matches, loading } = useMatches({ status: 'live' });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 live-pulse" />
            <Radio className="w-5 h-5 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold">Live Matches</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-border p-6 shimmer h-48" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No live matches right now</h3>
            <p className="text-muted-foreground text-sm">Check back soon for live action!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(match => (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-red-500 live-pulse" />
                    LIVE
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {match.overs} overs
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{match.team1Name}</span>
                    </div>
                    <span className="font-bold text-lg">
                      {match.team1Score}/{match.team1Wickets}
                    </span>
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{match.team2Name}</span>
                    </div>
                    <span className="font-bold text-lg text-muted-foreground">
                      {match.team2Score !== undefined ? `${match.team2Score}/${match.team2Wickets}` : 'Yet to bat'}
                    </span>
                  </div>
                </div>

                {match.currentStatus && (
                  <p className="mt-4 text-sm text-primary font-medium border-t border-border pt-3">
                    {match.currentStatus}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
