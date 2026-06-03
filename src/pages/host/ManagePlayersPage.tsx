import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyPlayers, Player } from '@/hooks/useTeamPlayer';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit2, Trash2, Search } from 'lucide-react';

const ManagePlayersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<
    string | number | null
  >(null);

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useMyPlayers();
  const players: Player[] = data ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (playerId: string | number) => {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete player');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', 'mine'] });
      setConfirmDeleteId(null);
    },
  });

  const filtered = players.filter((player: Player) =>
    player.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Manage Players</h1>
        </div>
        <Link
          to="/host/players/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <PlusCircle className="w-4 h-4" />
          Add Player
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-500">Loading players...</p>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-8">
          Failed to load players.
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No players found.</p>
          <Link
            to="/host/players/create"
            className="text-blue-600 hover:underline font-medium"
          >
            Add your first player →
          </Link>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['#', 'Name', 'Position', 'Team', 'Nationality', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((player: Player) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {player.number ?? '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">
                      {player.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {player.position ?? '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {player.teamId !== undefined ? (
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
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/host/players/${player.id}/edit`}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit player"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>

                      {confirmDeleteId === player.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              deleteMutation.mutate(player.id)
                            }
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(player.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete player"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagePlayersPage;
