import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTeams, Team } from '@/hooks/useTeam';

const TeamsPage: React.FC = () => {
  const { data, isLoading, error } = useTeams();
  const [search, setSearch] = useState('');

  const teams: Team[] = data ?? [];

  const filtered = teams.filter((team: Team) =>
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    (team.city ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500 py-12">
          <p>Error loading teams. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Teams</h1>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No teams found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((team: Team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow block"
            >
              <div className="flex items-center gap-4 mb-3">
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-14 h-14 object-contain rounded"
                  />
                ) : (
                  <div className="w-14 h-14 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xl">
                      {team.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {team.name}
                  </h2>
                  {team.city && (
                    <p className="text-sm text-gray-500">{team.city}</p>
                  )}
                </div>
              </div>

              {team.foundedYear && (
                <p className="text-xs text-gray-400">
                  Founded: {team.foundedYear}
                </p>
              )}

              {team.players && (
                <p className="text-xs text-gray-400 mt-1">
                  Players: {team.players.length}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
