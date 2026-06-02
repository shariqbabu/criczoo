import type { Match } from '../../types';
import { BarChart3, Target, Zap, TrendingUp } from 'lucide-react';

export function MatchStats({ match }: { match: Match }) {
  const innings1 = match.innings1;
  const innings2 = match.innings2;

  const getTopBatsmen = (innings: typeof innings1) => {
    if (!innings) return [];
    return [...innings.batsmen]
      .filter(b => b.didBat)
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 5);
  };

  const getTopBowlers = (innings: typeof innings1) => {
    if (!innings) return [];
    return [...innings.bowlers]
      .sort((a, b) => b.wickets - a.wickets || a.economy - b.economy)
      .slice(0, 5);
  };

  return (
    <div className="space-y-8">
      {/* Match Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {innings1 && (
          <>
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-center">
              <BarChart3 size={20} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-2xl font-bold text-white">{innings1.totalRuns}</p>
              <p className="text-xs text-gray-500">{innings1.battingTeamName} Total</p>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-center">
              <Target size={20} className="mx-auto text-red-400 mb-2" />
              <p className="text-2xl font-bold text-white">{innings1.totalWickets}</p>
              <p className="text-xs text-gray-500">Wickets Lost</p>
            </div>
          </>
        )}
        {innings2 && (
          <>
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-center">
              <BarChart3 size={20} className="mx-auto text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white">{innings2.totalRuns}</p>
              <p className="text-xs text-gray-500">{innings2.battingTeamName} Total</p>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-center">
              <Target size={20} className="mx-auto text-orange-400 mb-2" />
              <p className="text-2xl font-bold text-white">{innings2.totalWickets}</p>
              <p className="text-xs text-gray-500">Wickets Lost</p>
            </div>
          </>
        )}
      </div>

      {/* Top Performers */}
      {[innings1, innings2].filter(Boolean).map((innings, idx) => {
        if (!innings) return null;
        const topBatsmen = getTopBatsmen(innings);
        const topBowlers = getTopBowlers(innings);

        return (
          <div key={idx} className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-gray-700 pb-2">
              {innings.battingTeamName} - Performance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Batsmen */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Zap size={14} className="text-yellow-400" />
                  Top Batsmen
                </h4>
                <div className="space-y-2">
                  {topBatsmen.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-800/50 px-3 py-2">
                      <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-white truncate">{b.playerName}</span>
                          <span className="text-sm font-bold text-white ml-2">{b.runs}<span className="text-xs text-gray-500 font-normal">({b.balls})</span></span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                            style={{ width: `${Math.min((b.runs / (topBatsmen[0]?.runs || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Bowlers */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <TrendingUp size={14} className="text-emerald-400" />
                  Top Bowlers
                </h4>
                <div className="space-y-2">
                  {topBowlers.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-800/50 px-3 py-2">
                      <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-white truncate">{b.playerName}</span>
                          <span className="text-sm font-bold text-emerald-400 ml-2">{b.wickets}/{b.runs}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {b.overs.toFixed(1)} overs · Econ: {b.economy.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Run Rate Comparison */}
      {innings1 && innings2 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Run Rate Comparison</h3>
          <div className="grid grid-cols-2 gap-4">
            {[innings1, innings2].map((innings, i) => {
              const crr = innings.totalBalls > 0 ? (innings.totalRuns / innings.totalBalls) * 6 : 0;
              return (
                <div key={i} className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
                  <p className="text-sm text-gray-400 mb-1">{innings.battingTeamName}</p>
                  <p className="text-3xl font-bold text-white">{crr.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Run Rate</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fours</span>
                      <span className="text-blue-400 font-medium">{innings.batsmen.reduce((s, b) => s + b.fours, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sixes</span>
                      <span className="text-emerald-400 font-medium">{innings.batsmen.reduce((s, b) => s + b.sixes, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Extras</span>
                      <span className="text-yellow-400 font-medium">{innings.extras?.total || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
