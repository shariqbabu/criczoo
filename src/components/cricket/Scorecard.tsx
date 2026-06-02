import { useState } from 'react';
import type { Match, Innings } from '../../types';

function InningsTable({ innings, teamName }: { innings: Innings; teamName: string }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white">{teamName} Innings</h3>

      {/* Batting */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Batting</h4>
        <div className="rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/60">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Batter</th>
                <th className="text-right px-3 py-3 text-gray-400 font-medium">R</th>
                <th className="text-right px-3 py-3 text-gray-400 font-medium">B</th>
                <th className="text-right px-3 py-3 text-gray-400 font-medium">4s</th>
                <th className="text-right px-3 py-3 text-gray-400 font-medium">6s</th>
                <th className="text-right px-3 py-3 text-gray-400 font-medium">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {innings.batsmen.filter(b => b.didBat).map((b, i) => (
                <tr key={i} className={`${b.isStriker ? 'bg-emerald-500/5' : ''} hover:bg-white/5 transition-colors`}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">
                        {b.playerName}
                        {b.isStriker && <span className="ml-1 text-emerald-400">*</span>}
                        {b.isNonStriker && <span className="ml-1 text-blue-400">†</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        {b.dismissal ? b.dismissalDesc || b.dismissal : 'not out'}
                      </p>
                    </div>
                  </td>
                  <td className="text-right px-3 py-3 font-bold text-white">{b.runs}</td>
                  <td className="text-right px-3 py-3 text-gray-400">{b.balls}</td>
                  <td className="text-right px-3 py-3 text-blue-400">{b.fours}</td>
                  <td className="text-right px-3 py-3 text-emerald-400">{b.sixes}</td>
                  <td className="text-right px-3 py-3 text-gray-400">{b.strikeRate.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Extras & Total */}
        <div className="mt-2 rounded-xl border border-gray-700 bg-gray-800/30 px-4 py-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Extras: {innings.extras.total}
              <span className="text-xs text-gray-500 ml-2">
                (w {innings.extras.wide}, nb {innings.extras.noball}, b {innings.extras.bye}, lb {innings.extras.legbye})
              </span>
            </span>
            <span className="font-bold text-white">
              Total: {innings.totalRuns}/{innings.totalWickets} ({innings.totalOvers.toFixed(1)} ov)
            </span>
          </div>
        </div>
      </div>

      {/* Bowling */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Bowling</h4>
        <div className="rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/60">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Bowler</th>
                <th className="text-right px-3 py-3 text-gray-400 font-medium">O</th>
                <th className="text-right px-3 py-3 text-gray-400 font-medium">M</th>
                <th className="text-right px-3 py-3 text-gray-400 font-medium">R</th>
                <th className="text-right px-3 py-3 text-gray-400 font-medium">W</th>
                <th className="text-right px-3 py-3 text-gray-400 font-medium">Econ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {innings.bowlers.map((b, i) => (
                <tr key={i} className={`${b.isCurrent ? 'bg-blue-500/5' : ''} hover:bg-white/5 transition-colors`}>
                  <td className="px-4 py-3 text-white font-medium">
                    {b.playerName}
                    {b.isCurrent && <span className="ml-1 text-xs text-blue-400">*</span>}
                  </td>
                  <td className="text-right px-3 py-3 text-gray-400">{b.overs.toFixed(1)}</td>
                  <td className="text-right px-3 py-3 text-gray-400">{b.maidens}</td>
                  <td className="text-right px-3 py-3 text-gray-400">{b.runs}</td>
                  <td className="text-right px-3 py-3 font-bold text-white">{b.wickets}</td>
                  <td className="text-right px-3 py-3 text-gray-400">{b.economy.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fall of Wickets */}
      {innings.fallOfWickets && innings.fallOfWickets.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Fall of Wickets</h4>
          <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-4">
            <div className="flex flex-wrap gap-3">
              {innings.fallOfWickets.map((fow, i) => (
                <span key={i} className="text-sm">
                  <span className="text-white font-medium">{fow.runs}-{fow.wicketNumber}</span>
                  <span className="text-gray-500 ml-1">({fow.playerName}, {fow.over})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Partnerships */}
      {innings.partnerships && innings.partnerships.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Partnerships</h4>
          <div className="space-y-2">
            {innings.partnerships.map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-800/30 px-4 py-2.5">
                <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
                      style={{ width: `${Math.min((p.runs / (innings.totalRuns || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-white w-8 text-right">{p.runs}</span>
                <span className="text-xs text-gray-500">({p.balls}b)</span>
                <span className="text-xs text-gray-400 hidden sm:block">
                  {p.batsmanName} & {p.nonStrikerName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Scorecard({ match }: { match: Match }) {
  const [activeInnings, setActiveInnings] = useState<1 | 2>(match.currentInnings || 1);

  return (
    <div className="space-y-6">
      {/* Innings Toggle */}
      {(match.innings1 || match.innings2) && (
        <div className="flex rounded-xl border border-gray-700 p-1 bg-gray-800/50 w-fit">
          {match.innings1 && (
            <button
              onClick={() => setActiveInnings(1)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                activeInnings === 1 ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              {match.innings1.battingTeamName} (1st)
            </button>
          )}
          {match.innings2 && (
            <button
              onClick={() => setActiveInnings(2)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                activeInnings === 2 ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              {match.innings2.battingTeamName} (2nd)
            </button>
          )}
        </div>
      )}

      {/* Innings Content */}
      {activeInnings === 1 && match.innings1 ? (
        <InningsTable innings={match.innings1} teamName={match.innings1.battingTeamName} />
      ) : activeInnings === 2 && match.innings2 ? (
        <InningsTable innings={match.innings2} teamName={match.innings2.battingTeamName} />
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500">Scorecard will appear once the match begins</p>
        </div>
      )}
    </div>
  );
}
