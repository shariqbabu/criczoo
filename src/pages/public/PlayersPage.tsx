import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { usePlayers, Player } from '@/hooks/useTeamPlayer';

const PlayersPage: React.FC = () => {
  const { data, isLoading, error } = usePlayers();
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  const players: Player[] = data ?? [];

  const positions = Array.from(
    new Set(
      players
        .map((p: Player) => p.position)
        .filter((pos): pos is string => Boolean(pos))
    )
  ).sort();

  const filtered = players.filter((player: Player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesPosition = positionFilter
      ? player.position === positionFilter
      : true;
    return matchesSearch && matchesPosition;
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading players...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-500 py-12">
          <p>Error loading players. Please try again.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Players</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {positions.length > 0 && (
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Positions</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No players found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nationality
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((player: Player) => (
                  <tr
                    key={player.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {player.number ?? '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/players/${player.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {player.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {player.position ? (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {player.position}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {player.teamId ? (
                        <Link
                          to={`/teams/${player.teamId}`}
                          className="hover:text-blue-600"
                        >
                          {player.teamName ?? `Team ${player.teamId}`}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {player.nationality ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PlayersPage;
