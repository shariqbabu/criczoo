import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { useTournament, Match } from '@/hooks/useMatch';

const TournamentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: tournament, isLoading, error } = useTournament(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading tournament...</p>
        </div>
      </Layout>
    );
  }

  if (error || !tournament) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Tournament not found.</p>
          <Link to="/tournaments" className="text-blue-600 hover:underline">
            Back to Tournaments
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          to="/tournaments"
          className="text-blue-600 hover:underline text-sm mb-6 inline-block"
        >
          ← Back to Tournaments
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {tournament.name}
              </h1>
              {tournament.description && (
                <p className="text-gray-600">{tournament.description}</p>
              )}
            </div>
            {tournament.status && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  tournament.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : tournament.status === 'completed'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {tournament.status}
              </span>
            )}
          </div>

          <div className="flex gap-6 mt-4 text-sm text-gray-500">
            {tournament.startDate && (
              <div>
                <span className="font-medium text-gray-700">Start: </span>
                {new Date(tournament.startDate).toLocaleDateString()}
              </div>
            )}
            {tournament.endDate && (
              <div>
                <span className="font-medium text-gray-700">End: </span>
                {new Date(tournament.endDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Matches */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Matches</h2>
          </div>

          {!tournament.matches || tournament.matches.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No matches scheduled yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tournament.matches.map((match: Match) => (
                <div
                  key={match.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="font-medium text-gray-900 text-right flex-1">
                      {match.homeTeam ?? 'TBD'}
                    </span>
                    <div className="text-center px-4">
                      {match.status === 'completed' ? (
                        <span className="text-xl font-bold">
                          {match.homeScore ?? 0} - {match.awayScore ?? 0}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">vs</span>
                      )}
                      {match.date && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(match.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className="font-medium text-gray-900 flex-1">
                      {match.awayTeam ?? 'TBD'}
                    </span>
                  </div>

                  {match.status && (
                    <span
                      className={`ml-4 px-2 py-0.5 rounded text-xs capitalize ${
                        match.status === 'live'
                          ? 'bg-red-100 text-red-600'
                          : match.status === 'completed'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {match.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TournamentDetailPage;
