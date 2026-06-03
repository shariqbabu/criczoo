import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { useTournaments, Tournament } from '@/hooks/useMatch';

const TournamentsPage: React.FC = () => {
  const { data, isLoading, error } = useTournaments();

  const tournaments: Tournament[] = data ?? [];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading tournaments...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-500">
          <p>Error loading tournaments.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tournaments</h1>

        {tournaments.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No tournaments available.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournaments.map((t: Tournament) => (
              <Link
                key={t.id}
                to={`/tournaments/${t.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2">{t.name}</h2>
                {t.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {t.description}
                  </p>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  {t.startDate && (
                    <span>{new Date(t.startDate).toLocaleDateString()}</span>
                  )}
                  {t.status && (
                    <span className="capitalize bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {t.status}
                    </span>
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
