import React, { useState } from 'react';
import type { Match, Innings } from '../../types';
import { cn } from '../../lib/utils';

interface MatchScoreboardProps {
  match: Match;
}

const BattingTable: React.FC<{ innings: Innings }> = ({ innings }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-slate-500 border-b border-slate-700/50">
          <th className="text-left py-2 pl-3 font-medium">Batter</th>
          <th className="text-right py-2 px-2 font-medium">R</th>
          <th className="text-right py-2 px-2 font-medium">B</th>
          <th className="text-right py-2 px-2 font-medium">4s</th>
          <th className="text-right py-2 px-2 font-medium">6s</th>
          <th className="text-right py-2 pr-3 font-medium">SR</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/50">
        {innings.batting.map((b) => (
          <tr key={b.playerId} className={cn(
            'hover:bg-slate-800/30 transition-colors',
            !b.isOut && 'bg-green-500/5'
          )}>
            <td className="py-2.5 pl-3">
              <p className={cn(
                'font-medium',
                b.isOut ? 'text-slate-300' : 'text-green-300'
              )}>
                {b.playerName}
                {!b.isOut && <span className="text-green-500 ml-1">*</span>}
              </p>
              {b.dismissal && (
                <p className="text-xs text-slate-500 mt-0.5">{b.dismissal}</p>
              )}
            </td>
            <td className="text-right py-2.5 px-2 font-bold text-white">{b.runs}</td>
            <td className="text-right py-2.5 px-2 text-slate-400">{b.balls}</td>
            <td className="text-right py-2.5 px-2 text-slate-400">{b.fours}</td>
            <td className="text-right py-2.5 px-2 text-slate-400">{b.sixes}</td>
            <td className="text-right py-2.5 pr-3 text-slate-400">{b.strikeRate}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-slate-700/60 bg-slate-800/20">
          <td colSpan={6} className="py-2.5 pl-3 text-sm">
            <span className="font-semibold text-white">
              {innings.runs}/{innings.wickets}
            </span>
            <span className="text-slate-400 ml-2">
              ({innings.overs}.{innings.balls} ov)
            </span>
            {innings.extras > 0 && (
              <span className="text-slate-500 ml-2">Extras: {innings.extras}</span>
            )}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
);

const BowlingTable: React.FC<{ innings: Innings }> = ({ innings }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-slate-500 border-b border-slate-700/50">
          <th className="text-left py-2 pl-3 font-medium">Bowler</th>
          <th className="text-right py-2 px-2 font-medium">O</th>
          <th className="text-right py-2 px-2 font-medium">M</th>
          <th className="text-right py-2 px-2 font-medium">R</th>
          <th className="text-right py-2 px-2 font-medium">W</th>
          <th className="text-right py-2 pr-3 font-medium">Eco</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/50">
        {innings.bowling.map((b) => (
          <tr key={b.playerId} className="hover:bg-slate-800/30 transition-colors">
            <td className="py-2.5 pl-3 font-medium text-slate-200">{b.playerName}</td>
            <td className="text-right py-2.5 px-2 text-slate-400">{b.overs}</td>
            <td className="text-right py-2.5 px-2 text-slate-400">{b.maidens}</td>
            <td className="text-right py-2.5 px-2 text-slate-400">{b.runs}</td>
            <td className="text-right py-2.5 px-2 font-bold text-white">{b.wickets}</td>
            <td className="text-right py-2.5 pr-3 text-slate-400">{b.economy}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const MatchScoreboard: React.FC<MatchScoreboardProps> = ({ match }) => {
  const [activeTab, setActiveTab] = useState<'innings1' | 'innings2'>('innings1');

  const innings = activeTab === 'innings1' ? match.innings1 : match.innings2;
  const [scoreTab, setScoreTab] = useState<'batting' | 'bowling'>('batting');

  if (!innings) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-slate-400">Scorecard not available yet</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-0">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Scorecard</h3>
        {/* Innings selector */}
        <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl mb-0">
          <button
            onClick={() => setActiveTab('innings1')}
            className={cn(
              'flex-1 text-xs py-1.5 rounded-lg font-medium transition-all',
              activeTab === 'innings1'
                ? 'bg-green-500/20 text-green-400'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {match.teamA.shortName} Innings
          </button>
          <button
            onClick={() => setActiveTab('innings2')}
            disabled={!match.innings2}
            className={cn(
              'flex-1 text-xs py-1.5 rounded-lg font-medium transition-all disabled:opacity-40',
              activeTab === 'innings2'
                ? 'bg-green-500/20 text-green-400'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {match.teamB.shortName} Innings
          </button>
        </div>
      </div>

      {/* Bat/Bowl tabs */}
      <div className="flex border-b border-slate-700/50 mt-3">
        <button
          onClick={() => setScoreTab('batting')}
          className={cn(
            'flex-1 text-xs py-2.5 font-medium transition-all',
            scoreTab === 'batting'
              ? 'text-green-400 border-b-2 border-green-500'
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          Batting
        </button>
        <button
          onClick={() => setScoreTab('bowling')}
          className={cn(
            'flex-1 text-xs py-2.5 font-medium transition-all',
            scoreTab === 'bowling'
              ? 'text-green-400 border-b-2 border-green-500'
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          Bowling
        </button>
      </div>

      {/* Table */}
      {scoreTab === 'batting' ? (
        innings.batting.length > 0 ? (
          <BattingTable innings={innings} />
        ) : (
          <p className="text-center text-slate-500 text-sm py-8">No batting data yet</p>
        )
      ) : innings.bowling.length > 0 ? (
        <BowlingTable innings={innings} />
      ) : (
        <p className="text-center text-slate-500 text-sm py-8">No bowling data yet</p>
      )}
    </div>
  );
};
