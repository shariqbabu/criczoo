import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyTeams, Team } from '@/hooks/useTeam';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit2, Trash2, Search, Users } from 'lucide-react';

const ManageTeamsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<
    string | number | null
  >(null);

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useMyTeams();
  const teams: Team[] = data ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (teamId: string | number) => {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete team');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', 'mine'] });
      setConfirmDeleteId(null);
    },
  });

  const filtered = teams.filter((team: Team) =>
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    (team.city ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-600" />
          <h1 className="text-2xl font-bold">Manage Teams</h1>
        </div>
        <Link
          to="/host/teams/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <PlusCircle className="w-4 h-4" />
          Add Team
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-500">Loading teams...</p>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-8">
          Failed to load teams.
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No teams found.</p>
          <Link
            to="/host/teams/create"
            className="text-blue-600 hover:underline font-medium"
          >
            Create your first team →
          </Link>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((team: Team) => (
            <div
              key={team.id}
              className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {team.logo ? (
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <span className="text-blue-600 font-bold text-xl">
                      {team.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">
                    {team.name}
                  </h2>
                  {team.city && (
                    <p className="text-sm text-gray-500">{team.city}</p>
                  )}
                  {team.players && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {team.players.length} players
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <Link
                    to={`/host/teams/${team.id}/edit`}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit team"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>

                  {confirmDeleteId === team.id ? (
                    <div className="flex gap-1 items-center">
                      <button
                        onClick={() => deleteMutation.mutate(team.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(team.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  to={`/host/teams/${team.id}`}
                  className="flex-1 text-center text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  Manage
                </Link>
                <Link
                  to={`/teams/${team.id}`}
                  className="flex-1 text-center text-sm border border-blue-300 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                >
                  View Public
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageTeamsPage;
