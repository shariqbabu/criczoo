import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getHostTournaments,
  HostTournament,
} from '@/services/tournamentService';
import { Trophy, PlusCircle } from 'lucide-react';

const statusStyles: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
};

const HostTournamentsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery<HostTournament[]>({
    queryKey: ['tournaments', 'mine'],
    queryFn: getHostTournaments,
  });

  const tournaments: HostTournament[] = data ?? [];

  const filtered = tournaments.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-7 h-7 text-blue-600" />
          <h1 className="text-2xl font-bold">My Tournaments</h1>
        </div>
        <Link
          to="/host/tournaments/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <PlusCircle className="w-4 h-4" />
          New Tournament
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tournaments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-500">Loading tournaments...</p>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-8">
          Failed to load tournaments.
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No tournaments found.</p>
          <Link
            to="/host/tournaments/create"
            className="text-blue-600 hover:underline font-medium"
          >
            Create your first tournament →
          </Link>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t: HostTournament) => (
            <div
              key={t.id}
              className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="font-semibold text-gray-900 text-lg">
                  {t.name}
                </h2>
                {t.status && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      statusStyles[t.status] ?? 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {t.status}
                  </span>
                )}
              </div>

              {t.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {t.description}
                </p>
              )}

              <div className="flex gap-4 text-xs text-gray-400 mb-4">
                {t.startDate && (
                  <span>
                    Start: {new Date(t.startDate).toLocaleDateString()}
                  </span>
                )}
                {t.matchCount !== undefined && (
                  <span>{t.matchCount} matches</span>
                )}
                {t.teamCount !== undefined && (
                  <span>{t.teamCount} teams</span>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/host/tournaments/${t.id}`}
                  className="flex-1 text-center text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Manage
                </Link>
                <Link
                  to={`/tournaments/${t.id}`}
                  className="flex-1 text-center text-sm border border-blue-300 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
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

export default HostTournamentsPage;
