import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { useLiveMatches, Match } from '@/hooks/useMatch';

const LiveMatchCard: React.FC<{ match: Match }> = ({ match }) => (
  <Link
    to={`/matches/${match.id}`}
    className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
  >
    {/* Live badge */}
    <div className="flex justify-between items-center mb-4">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        LIVE
      </span>
      {match.venue && (
        <span className="text-xs text-gray-400">{match.venue}</span>
      )}
    </div>

    {/* Score */}
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 text-right">
        <p className="font-semibold text-gray-900">{match.homeTeam ?? 'TBD'}</p>
      </div>
      <div className="text-center px-4">
        <span className="text-2xl font-bold text-gray-900">
          {match.homeScore ?? 0} - {match.awayScore ?? 0}
        </span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{match.awayTeam ?? 'TBD'}</p>
      </div>
    </div>

    {match.date && (
      <p className="text-xs text-gray-400 text-center mt-3">
        {new Date(match.date).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    )}
  </Link>
);

const LiveMatchPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useLiveMatches();
  const matches: Match[] = data ?? [];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h1 className="text-3xl font-bold">Live Matches</h1>
          </div>
          <button
            onClick={() => refetch()}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading live matches...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-12">
            <p>Error loading live matches.</p>
          </div>
        )}

        {!isLoading && !error && matches.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-5xl mb-4">⚽</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Live Matches
            </h2>
            <p className="text-gray-500 mb-6">
              There are no matches being played right now.
            </p>
            <Link
              to="/matches"
              className="text-blue-600 hover:underline font-medium"
            >
              View all matches →
            </Link>
          </div>
        )}

        {matches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match: Match) => (
              <LiveMatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LiveMatchPage;
