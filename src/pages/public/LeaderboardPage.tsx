import React, { useState } from 'react';
import Layout from '@/components/common/Layout';
import { useLeaderboard, LeaderboardEntry, useTournaments, Tournament } from '@/hooks/useMatch';

const FormBadge: React.FC<{ result: 'W' | 'D' | 'L' }> = ({ result }) => {
  const styles: Record<string, string> = {
    W: 'bg-green-500 text-white',
    D: 'bg-gray-400 text-white',
    L: 'bg-red-500 text-white',
  };
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${styles[result]}`}
    >
      {result}
    </span>
  );
};

const LeaderboardPage: React.FC = () => {
  const [selectedTournament, setSelectedTournament] = useState<
    string | undefined
  >(undefined);

  const { data: tournamentsData } = useTournaments();
  const tournaments: Tournament[] = tournamentsData ?? [];

  const { data, isLoading, error } = useLeaderboard(selectedTournament);
  const entries: LeaderboardEntry[] = data ?? [];

  const getRankStyle = (rank: number): string => {
    if (rank === 1) return 'bg-yellow-50 font-semibold';
    if (rank === 2) return 'bg-gray-50 font-semibold';
    if (rank === 3) return 'bg-orange-50 font-semibold';
    return '';
  };

  const getRankBadge = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return String(rank);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

        {/* Tournament filter */}
        {tournaments.length > 0 && (
          <div className="mb-6">
            <select
              value={selectedTournament ?? ''}
              onChange={(e) =>
                setSelectedTournament(e.target.value || undefined)
              }
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tournaments</option>
              {tournaments.map((t: Tournament) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading leaderboard...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-12">
            <p>Error loading leaderboard. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && entries.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            <p>No leaderboard data available.</p>
          </div>
        )}

        {entries.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      W
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      D
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      L
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GF
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GA
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GD
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-bold">
                      Pts
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Form
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((entry: LeaderboardEntry, i: number) => (
                    <tr
                      key={entry.teamId}
                      className={`hover:bg-blue-50 transition-colors ${getRankStyle(
                        entry.rank
                      )}`}
                    >
                      <td className="px-4 py-4 text-center">
                        <span className="text-lg">
                          {getRankBadge(entry.rank)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900">
                          {entry.teamName}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-700">
                        {entry.played}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-green-600 font-medium">
                        {entry.won}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-500">
                        {entry.drawn}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-red-500">
                        {entry.lost}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-700">
                        {entry.goalsFor}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-700">
                        {entry.goalsAgainst}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-700">
                        {entry.goalDifference > 0
                          ? `+${entry.goalDifference}`
                          : entry.goalDifference}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-base font-bold text-gray-900">
                          {entry.points}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="flex gap-1">
                          {entry.form
                            ? entry.form.map(
                                (result: 'W' | 'D' | 'L', idx: number) => (
                                  <FormBadge key={idx} result={result} />
                                )
                              )
                            : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex flex-wrap gap-4">
              <span>P = Played</span>
              <span>W = Won</span>
              <span>D = Drawn</span>
              <span>L = Lost</span>
              <span>GF = Goals For</span>
              <span>GA = Goals Against</span>
              <span>GD = Goal Difference</span>
              <span>Pts = Points</span>
            </div>
          </div>
        )}

        {/* Unused index suppression - i used for key only */}
        {void (entries.length > 0 && i)}
      </div>
    </Layout>
  );
};

// Suppress unused variable warning for loop index used only as key
declare const i: never;

export default LeaderboardPage;
