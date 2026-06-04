import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useTournament } from '@/hooks/useMatch';
import { ArrowLeft, Trophy, Calendar, Users } from 'lucide-react';
import type { Match } from '@/types';

export default function TournamentDetailPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { tournament, matches, loading } = useTournament(tournamentId);

  if (loading) return <Layout><div className="max-w-4xl mx-auto px-4 py-8"><div className="shimmer h-48 rounded-xl" /></div></Layout>;

  if (!tournament) return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Tournament not found.</p>
        <Link to="/tournaments" className="text-primary hover:underline text-sm mt-2 inline-block">Browse Tournaments</Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/tournaments" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> All Tournaments
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-8 h-8 text-yellow-200" />
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-yellow-100">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(tournament.startDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {tournament.teams?.length ?? 0} teams
            </span>
          </div>
          {tournament.description && (
            <p className="mt-3 text-yellow-50 text-sm">{tournament.description}</p>
          )}
        </div>

        {/* Matches */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Matches</h2>
          {matches.length === 0 ? (
            <p className="text-muted-foreground text-sm">No matches scheduled yet.</p>
          ) : (
            <div className="space-y-3">
              {matches.map((match: Match) => (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{match.teamA.name} vs {match.teamB.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{match.status}</p>
                  </div>
                  {match.status === 'live' && (
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">LIVE</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
