import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, Zap } from 'lucide-react';
import type { Match } from '../../types';
import { Badge } from '../ui/Badge';
import { cn, formatMatchScore } from '../../lib/utils';

interface LiveMatchCardProps {
  match: Match;
  className?: string;
}

export const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match, className }) => {
  const currentInnings = match.currentInnings === 1 ? match.innings1 : match.innings2;
  const battingTeam =
    match.currentInnings === 1 ? match.teamA : match.teamB;
  const bowlingTeam =
    match.currentInnings === 1 ? match.teamB : match.teamA;

  const target = match.targetRuns;
  const scored = currentInnings?.runs ?? 0;
  const needed = target ? target - scored : null;
  const oversLeft = match.format === 'T20' ? 20 - (currentInnings?.overs ?? 0) : null;

  return (
    <Link
      to={`/match/${match.id}`}
      className={cn(
        'block glass-card rounded-2xl overflow-hidden card-hover group',
        className
      )}
    >
      {/* Live header */}
      <div className="bg-gradient-to-r from-red-900/30 to-rose-900/20 border-b border-red-500/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="live">LIVE</Badge>
          <span className="text-xs text-slate-400">{match.format}</span>
          {match.tournamentName && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 truncate max-w-[100px]">
                {match.tournamentName}
              </span>
            </>
          )}
        </div>
        <Zap size={14} className="text-yellow-400" />
      </div>

      <div className="p-4">
        {/* Teams */}
        <div className="space-y-3">
          {/* Batting Team */}
          <div
            className={cn(
              'flex items-center justify-between p-3 rounded-xl',
              'bg-green-500/8 border border-green-500/15'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                {battingTeam.shortName}
              </div>
              <span className="text-sm font-semibold text-white truncate">
                {battingTeam.name}
              </span>
              <span className="text-xs text-green-400 shrink-0">batting</span>
            </div>
            <div className="text-right shrink-0 ml-2">
              {currentInnings ? (
                <p className="text-xl font-bold text-white score-display">
                  {currentInnings.runs}
                  <span className="text-slate-400 text-base font-medium">
                    /{currentInnings.wickets}
                  </span>
                </p>
              ) : (
                <p className="text-slate-500 text-sm">Yet to bat</p>
              )}
              {currentInnings && (
                <p className="text-xs text-slate-400">
                  ({currentInnings.overs}.{currentInnings.balls} ov)
                </p>
              )}
            </div>
          </div>

          {/* Bowling Team */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                {bowlingTeam.shortName}
              </div>
              <span className="text-sm font-medium text-slate-300 truncate">
                {bowlingTeam.name}
              </span>
            </div>
            {match.currentInnings === 2 && match.innings1 ? (
              <div className="text-right shrink-0 ml-2">
                <p className="text-base font-semibold text-slate-300 score-display">
                  {formatMatchScore(match.innings1)}
                </p>
              </div>
            ) : (
              <p className="text-slate-500 text-xs shrink-0">Yet to bat</p>
            )}
          </div>
        </div>

        {/* Target / Status */}
        {target && needed !== null && needed > 0 && (
          <div className="mt-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-xs text-blue-300">
              <span className="font-semibold">{battingTeam.shortName}</span> need{' '}
              <span className="font-bold text-white">{needed}</span> runs
              {oversLeft !== null && oversLeft > 0 && (
                <> in <span className="font-bold text-white">{oversLeft}</span> overs</>
              )}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={11} />
            <span className="truncate max-w-[160px]">{match.venue}</span>
          </div>
          <div className="flex items-center gap-1 text-green-400 group-hover:gap-2 transition-all">
            <span>Live Score</span>
            <ChevronRight size={13} />
          </div>
        </div>
      </div>
    </Link>
  );
};
