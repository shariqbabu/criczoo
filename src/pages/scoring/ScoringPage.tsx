import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { useMatch } from '@/hooks/useMatch';

const ScoringPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: match, isLoading, error } = useMatch(id);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading match...</p>
        </div>
      </Layout>
    );
  }

  if (error || !match) {
    return (
      <Layout>
        <div className="text-center text-red-500">
          <p>Error loading match details.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Live Scoring</h1>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <h2 className="text-xl font-semibold mb-4">{match.homeTeam}</h2>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setHomeScore((s) => Math.max(0, s - 1))}
                  className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold hover:bg-red-200"
                >
                  -
                </button>
                <span className="text-4xl font-bold">{homeScore}</span>
                <button
                  onClick={() => setHomeScore((s) => s + 1)}
                  className="w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold hover:bg-green-200"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-3xl font-bold text-gray-400 px-4">VS</div>

            <div className="text-center flex-1">
              <h2 className="text-xl font-semibold mb-4">{match.awayTeam}</h2>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setAwayScore((s) => Math.max(0, s - 1))}
                  className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold hover:bg-red-200"
                >
                  -
                </button>
                <span className="text-4xl font-bold">{awayScore}</span>
                <button
                  onClick={() => setAwayScore((s) => s + 1)}
                  className="w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold hover:bg-green-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => {
                console.log('Saving score:', { homeScore, awayScore });
              }}
            >
              Save Score
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ScoringPage;
