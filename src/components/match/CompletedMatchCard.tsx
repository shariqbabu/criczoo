import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import type { Match } from '../../types';
import { Badge } from '../ui/Badge';
import { cn, formatMatchScore, formatDate } from '../../lib/utils';

interface CompletedMatchCardProps {
  match: Match;
  className?: string;
}

export const CompletedMatchCard: React.FC<CompletedMatchCardProps> = ({
  match,
  className,
}) => (
  <Link
    to={`/match/${match.id}`}
    className={cn(
      'block glass-card rounded-xl p-4 card-hover group',
      className
    )}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Badge variant="completed">Completed</Badge>
        <span className="text-xs text-slate-500">{match.format}</span>
      </div>
      <ChevronRight
        size={14}
        className="text-slate-600 group-hover:text-slate-400 transition-colors"
      />
    </div>

    <div className="space-y-2">
      {/* Team A */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            {match.teamA.shortName}
          </div>
          <span className="text-sm font-medium text-slate-200">{match.teamA.name}</span>
        </div>
        {match.innings1 ? (
          <span className="text-sm font-semibold text-white score-display">
            {formatMatchScore(match.innings1)}
          </span>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        )}
      </div>

      {/* Team B */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            {match.teamB.shortName}
          </div>
          <span className="text-sm font-medium text-slate-200">{match.teamB.name}</span>
        </div>
        {match.innings2 ? (
          <span className="text-sm font-semibold text-white score-display">
            {formatMatchScore(match.innings2)}
          </span>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        )}
      </div>
    </div>

    {/* Result */}
    {match.result && (
      <div className="mt-3 px-3 py-1.5 bg-slate-800/60 rounded-lg">
        <p className="text-xs text-slate-300 font-medium">{match.result}</p>
      </div>
    )}

    <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
      <div className="flex items-center gap-1">
        <MapPin size={10} />
        <span className="truncate max-w-[140px]">{match.venue}</span>
      </div>
      <span>{formatDate(match.scheduledAt)}</span>
    </div>
  </Link>
);
