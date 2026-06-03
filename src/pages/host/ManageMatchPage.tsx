import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatch, Match } from '@/hooks/useMatch';
import { useTeams, Team } from '@/hooks/useTeam';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '@/services/matchService';

const ManageMatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: match, isLoading: matchLoading } = useMatch(id);
  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const teams: Team[] = teamsData ?? [];

  const [homeScore, setHomeScore] = useState<number>(
    match?.homeScore ?? 0
  );
  const [awayScore, setAwayScore] = useState<number>(
    match?.awayScore ?? 0
  );
  const [error, setError] = useState<string | null>(null);

  const updateScoreMutation = useMutation({
    mutationFn: () =>
      matchService.updateScore({
        matchId: id!,
        homeScore,
        awayScore,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (err: Error) => {
      setError(err.message ?? 'Failed to update score');
    },
  });

  if (matchLoading || teamsLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>Match not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Manage Match</h1>

      {/* Teams display */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <p className="font-semibold text-lg text-gray-900">
              {match.homeTeam ?? 'Home Team'}
            </p>
          </div>
          <div className="px-6 text-gray-400 font-bold">VS</div>
          <div className="text-center flex-1">
            <p className="font-semibold text-lg text-gray-900">
              {match.awayTeam ?? 'Away Team'}
            </p>
          </div>
        </div>

        {/* Team select (for reassignment) */}
        {teams.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Home Team
              </label>
              <select
                defaultValue={String(match.homeTeamId ?? '')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {teams.map((team: Team) => (
                  <option key={team.id} value={String(team.id)}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Away Team
              </label>
              <select
                defaultValue={String(match.awayTeamId ?? '')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {teams.map((team: Team) => (
                  <option key={team.id} value={String(team.id)}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Score updater */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Update Score</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              {match.homeTeam ?? 'Home'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHomeScore((s) => Math.max(0, s - 1))}
                className="w-9 h-9 rounded-full bg-red-100 text-red-600 font-bold hover:bg-red-200"
              >
                -
              </button>
              <span className="text-4xl font-bold w-12 text-center">
                {homeScore}
              </span>
              <button
                onClick={() => setHomeScore((s) => s + 1)}
                className="w-9 h-9 rounded-full bg-green-100 text-green-600 font-bold hover:bg-green-200"
              >
                +
              </button>
            </div>
          </div>

          <span className="text-2xl text-gray-300 font-bold">-</span>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              {match.awayTeam ?? 'Away'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAwayScore((s) => Math.max(0, s - 1))}
                className="w-9 h-9 rounded-full bg-red-100 text-red-600 font-bold hover:bg-red-200"
              >
                -
              </button>
              <span className="text-4xl font-bold w-12 text-center">
                {awayScore}
              </span>
              <button
                onClick={() => setAwayScore((s) => s + 1)}
                className="w-9 h-9 rounded-full bg-green-100 text-green-600 font-bold hover:bg-green-200"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => updateScoreMutation.mutate()}
            disabled={updateScoreMutation.isPending}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {updateScoreMutation.isPending ? 'Saving...' : 'Save Score'}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-300 text-gray-700 px-8 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      {/* Match info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Match Details</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {match.date && (
            <>
              <dt className="text-gray-500">Date</dt>
              <dd className="font-medium">
                {new Date(match.date).toLocaleString()}
              </dd>
            </>
          )}
          {match.venue && (
            <>
              <dt className="text-gray-500">Venue</dt>
              <dd className="font-medium">{match.venue}</dd>
            </>
          )}
          {match.status && (
            <>
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium capitalize">{match.status}</dd>
            </>
          )}
        </dl>
      </div>
    </div>
  );
};

export default ManageMatchPage;
