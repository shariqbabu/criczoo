import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Trophy } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import type { Match } from '../../types';
import { formatDistanceToNow } from 'date-fns';

function TeamScore({ team, innings }: {
  team: Match['teamA'];
  innings?: { totalRuns: number; totalWickets: number; totalOvers: number };
}) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-lg overflow-hidden">
        {team.logoURL ? (
          <img src={team.logoURL} alt={team.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-gray-300">{team.shortName?.slice(0, 2) || team.name.slice(0, 2)}</span>
        )}
      </div>
      <span className="text-xs font-semibold text-gray-300 truncate max-w-[80px]">{team.shortName || team.name}</span>
      {innings && (
        <div className="text-center">
          <span className="text-xl font-bold text-white">{innings.totalRuns}/{innings.totalWickets}</span>
          <p className="text-xs text-gray-500">{innings.totalOvers.toFixed(1)} ov</p>
        </div>
      )}
    </div>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === 'live';
  const innings1 = match.innings1;
  const innings2 = match.innings2;

  return (
    <Link to={`/matches/${match.id}`}>
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        className={`rounded-2xl border bg-gray-900/80 p-5 transition-all cursor-pointer ${
          isLive ? 'border-red-500/30 shadow-lg shadow-red-500/10' : 'border-gray-700/50 hover:border-emerald-500/30'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={match.status} />
            <span className="text-xs text-gray-500">{match.format}</span>
          </div>
          {match.tournamentName && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Trophy size={12} />
              <span className="truncate max-w-[120px]">{match.tournamentName}</span>
            </div>
          )}
        </div>

        {/* Teams & Scores */}
        <div className="flex items-center justify-between gap-4">
          <TeamScore team={match.teamA} innings={innings1} />

          <div className="flex flex-col items-center gap-1">
            <div className="rounded-lg bg-gray-700/50 px-2 py-1">
              <span className="text-xs font-bold text-gray-300">VS</span>
            </div>
            {match.status === 'completed' && match.result && (
              <span className="text-xs text-emerald-400 text-center leading-tight">{match.result}</span>
            )}
          </div>

          <TeamScore team={match.teamB} innings={innings2} />
        </div>

        {/* Live Target */}
        {isLive && match.currentInnings === 2 && innings1 && (
          <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-center">
            <span className="text-xs text-emerald-400">
              Target: {innings1.totalRuns + 1} runs
              {innings2 && (
                <> | Need {innings1.totalRuns + 1 - innings2.totalRuns} from {((match.totalOvers - innings2.totalOvers) * 6).toFixed(0)} balls</>
              )}
            </span>
          </div>
        )}

        {/* Toss Info */}
        {match.tossWinner && match.status === 'upcoming' && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">Toss: {match.tossWinner} chose to {match.tossDecision}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} />
            <span className="truncate max-w-[120px]">{match.venue}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            <span>
              {match.createdAt
                ? formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })
                : ''}
            </span>
          </div>
        </div>

        {/* Recent balls for live match */}
        {isLive && match.recentBalls && match.recentBalls.length > 0 && (
          <div className="mt-3 flex items-center gap-1">
            <span className="text-xs text-gray-500 mr-1">This over:</span>
            {match.recentBalls.slice(-6).map((ball, i) => (
              <span
                key={i}
                className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  ball === '4' ? 'bg-blue-500/30 text-blue-300' :
                  ball === '6' ? 'bg-emerald-500/30 text-emerald-300' :
                  ball === 'W' ? 'bg-red-500/30 text-red-300' :
                  ball === 'Wd' || ball === 'Nb' ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-gray-700 text-gray-300'
                }`}
              >
                {ball}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
