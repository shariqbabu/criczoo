import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { useTournament, Match } from '@/hooks/useMatch';

const TournamentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: tournament, isLoading, error } = useTournament(id ?? '');

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading tournament...</p>
        </div>
      </Layout>
    );
  }

  if (error || !tournament) {
    return (
      <Layout>
        <div className="text-center text-red-500">
          <p>Error loading tournament details.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{tournament.name}</h1>

        {tournament.description && (
          <p className="text-gray-600 mb-6">{tournament.description}</p>
        )}

        <div className="flex gap-4 mb-8 text-sm text-gray-500">
          {tournament.startDate && (
            <span>Start: {new Date(tournament.startDate).toLocaleDateString()}</span>
          )}
          {tournament.endDate && (
            <span>End: {new Date(tournament.endDate).toLocaleDateString()}</span>
          )}
          {tournament.status && (
            <span className="capitalize">Status: {tournament.status}</span>
          )}
        </div>

        {tournament.matches && tournament.matches.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Matches</h2>
            <div className="space-y-4">
              {tournament.matches.map((match: Match) => (
                <div
                  key={match.id}
                  className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
                >
                  <span className="font-medium">{match.homeTeam}</span>
                  <span className="text-gray-500">
                    {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
                  </span>
                  <span className="font-medium">{match.awayTeam}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TournamentDetailPage;
