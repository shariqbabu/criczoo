import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import type { Match } from '../../types';
import { Badge } from '../ui/Badge';
import { cn, formatDateTime } from '../../lib/utils';

interface UpcomingMatchCardProps {
  match: Match;
  className?: string;
}

export const UpcomingMatchCard: React.FC<UpcomingMatchCardProps> = ({
  match,
  className,
}) => (
  <Link
    to={`/match/${match.id}`}
    className={cn(
      'block glass-card rounded-2xl p-4 card-hover group',
      className
    )}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="space-y-1">
        <Badge variant="upcoming">Upcoming</Badge>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="text-slate-400 font-medium">{match.format}</span>
          {match.tournamentName && (
            <>
              <span>·</span>
              <span className="truncate max-w-[120px]">{match.tournamentName}</span>
            </>
          )}
        </div>
      </div>
      <ChevronRight
        size={16}
        className="text-slate-600 group-hover:text-green-400 group-hover:translate-x-0.5 transition-all"
      />
    </div>

    {/* Teams */}
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-white mb-2">
          {match.teamA.shortName}
        </div>
        <p className="text-xs font-semibold text-white truncate">{match.teamA.name}</p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">VS</span>
      </div>

      <div className="flex-1 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-white mb-2">
          {match.teamB.shortName}
        </div>
        <p className="text-xs font-semibold text-white truncate">{match.teamB.name}</p>
      </div>
    </div>

    {/* Info */}
    <div className="border-t border-slate-700/50 pt-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Clock size={11} />
        {formatDateTime(match.scheduledAt)}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin size={11} />
        <span className="truncate">{match.venue}</span>
      </div>
    </div>
  </Link>
);
