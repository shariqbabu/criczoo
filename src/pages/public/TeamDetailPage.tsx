import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTeam, Player } from '@/hooks/useTeam';

const TeamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: team, isLoading, error } = useTeam(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading team...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Team not found.</p>
          <Link
            to="/teams"
            className="text-blue-600 hover:underline"
          >
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/teams"
        className="text-blue-600 hover:underline text-sm mb-6 inline-block"
      >
        ← Back to Teams
      </Link>

      {/* Team Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-6">
          {team.logo ? (
            <img
              src={team.logo}
              alt={team.name}
              className="w-24 h-24 object-contain"
            />
          ) : (
            <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-4xl">
                {team.name.charAt(0)}
              </span>
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            {team.city && (
              <p className="text-gray-500 mt-1">{team.city}</p>
            )}
            {team.foundedYear && (
              <p className="text-gray-400 text-sm mt-1">
                Founded: {team.foundedYear}
              </p>
            )}
          </div>
        </div>

        {team.description && (
          <p className="mt-4 text-gray-600">{team.description}</p>
        )}
      </div>

      {/* Stats */}
      {(team.wins !== undefined ||
        team.losses !== undefined ||
        team.draws !== undefined) && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {team.wins ?? 0}
            </p>
            <p className="text-sm text-gray-500">Wins</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">
              {team.draws ?? 0}
            </p>
            <p className="text-sm text-gray-500">Draws</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {team.losses ?? 0}
            </p>
            <p className="text-sm text-gray-500">Losses</p>
          </div>
        </div>
      )}

      {/* Players */}
      {team.players && team.players.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              Players ({team.players.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {team.players.map((player: Player) => (
              <div
                key={player.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  {player.number !== undefined && (
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {player.number}
                    </span>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{player.name}</p>
                    {player.nationality && (
                      <p className="text-xs text-gray-400">
                        {player.nationality}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {player.position && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {player.position}
                    </span>
                  )}
                  {player.age !== undefined && (
                    <span>Age: {player.age}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!team.players || team.players.length === 0) && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No players registered for this team.
        </div>
      )}
    </div>
  );
};

export default TeamDetailPage;
