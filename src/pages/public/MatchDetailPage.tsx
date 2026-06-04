import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useMatch } from '@/hooks/useMatch';
import { ArrowLeft, FileText, Radio } from 'lucide-react';

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { match, loading } = useMatch(matchId!);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="shimmer h-64 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-semibold mb-2">Match not found</h2>
          <Link to="/" className="text-primary hover:underline text-sm">Go home</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/live" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Matches
        </Link>

        {/* Match header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-6 mb-6">
          {match.status === 'live' && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-400 live-pulse" />
              <span className="text-sm font-medium text-green-100">LIVE</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h2 className="text-xl font-bold">{match.team1Name}</h2>
              <p className="text-3xl font-bold mt-2">{match.team1Score}/{match.team1Wickets}</p>
              <p className="text-green-200 text-sm">({match.team1Overs} ov)</p>
            </div>

            <div className="px-6 text-center">
              <span className="text-green-200 text-sm font-medium">VS</span>
            </div>

            <div className="text-center flex-1">
              <h2 className="text-xl font-bold">{match.team2Name}</h2>
              {match.team2Score !== undefined ? (
                <>
                  <p className="text-3xl font-bold mt-2">{match.team2Score}/{match.team2Wickets}</p>
                  <p className="text-green-200 text-sm">({match.team2Overs} ov)</p>
                </>
              ) : (
                <p className="text-green-200 mt-2 text-sm">Yet to bat</p>
              )}
            </div>
          </div>

          {match.currentStatus && (
            <p className="text-center text-green-100 mt-4 text-sm border-t border-white/20 pt-4">
              {match.currentStatus}
            </p>
          )}
        </div>

        {/* Action links */}
        <div className="flex gap-3 mb-6">
          <Link
            to={`/matches/${matchId}/scorecard`}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <FileText className="w-4 h-4" />
            Full Scorecard
          </Link>
          {match.status === 'live' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
              <Radio className="w-4 h-4" />
              Live Updates
            </div>
          )}
        </div>

        {/* Match info */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Match Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Format</span>
              <p className="font-medium mt-0.5">{match.format || 'T20'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Overs</span>
              <p className="font-medium mt-0.5">{match.overs}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Venue</span>
              <p className="font-medium mt-0.5">{match.venue || 'TBD'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <p className="font-medium mt-0.5 capitalize">{match.status}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
