import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import type { Tournament } from '../../types';
import { format } from 'date-fns';

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <Link to={`/tournaments/${tournament.id}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="rounded-2xl border border-gray-700/50 bg-gray-900/80 overflow-hidden hover:border-emerald-500/30 transition-all cursor-pointer"
      >
        {/* Banner */}
        <div className="relative h-36 bg-gradient-to-br from-emerald-900/50 to-blue-900/50">
          {tournament.bannerURL ? (
            <img src={tournament.bannerURL} alt={tournament.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-5xl opacity-30">🏆</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <StatusBadge status={tournament.status} />
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-white text-lg leading-tight mb-3 line-clamp-1">{tournament.name}</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin size={14} className="text-emerald-400 flex-shrink-0" />
              <span className="truncate">{tournament.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar size={14} className="text-blue-400 flex-shrink-0" />
              <span>
                {tournament.startDate ? format(new Date(tournament.startDate), 'MMM d') : ''} – {tournament.endDate ? format(new Date(tournament.endDate), 'MMM d, yyyy') : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users size={14} className="text-purple-400 flex-shrink-0" />
              <span>{tournament.teams?.length || 0} teams</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500">Organized by <span className="text-emerald-400">{tournament.organizer}</span></p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
