import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { useTournaments, Tournament } from '@/hooks/useMatch';

const TournamentsPage: React.FC = () => {
  const { data, isLoading, error } = useTournaments();
  const [filter, setFilter] = useState<string>('all');

  const tournaments: Tournament[] = data ?? [];

  const filtered = tournaments.filter((t: Tournament) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading tournaments...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-500 py-12">
          <p>Error loading tournaments. Please try again.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tournaments</h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'upcoming', 'active', 'completed'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No tournaments found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((t: Tournament) => (
              <Link
                key={t.id}
                to={`/tournaments/${t.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow block"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t.name}
                  </h2>
                  {t.status && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        t.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : t.status === 'completed'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  )}
                </div>

                {t.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {t.description}
                  </p>
                )}

                <div className="flex gap-4 text-xs text-gray-400">
                  {t.startDate && (
                    <span>
                      Start:{' '}
                      {new Date(t.startDate).toLocaleDateString()}
                    </span>
                  )}
                  {t.endDate && (
                    <span>
                      End:{' '}
                      {new Date(t.endDate).toLocaleDateString()}
                    </span>
                  )}
                  {t.matches && (
                    <span>{t.matches.length} matches</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TournamentsPage;
