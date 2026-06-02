import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, MapPin, Search } from 'lucide-react';
import { getActiveTournaments } from '../services/tournamentService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Tournament } from '../types';
import { formatDate } from '../lib/utils';

export const TournamentsListPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getActiveTournaments()
      .then(setTournaments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tournaments.filter((t) =>
    search
      ? t.name.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen hero-bg pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-white mb-1"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Tournaments
          </h1>
          <p className="text-slate-400 text-sm">
            Browse active cricket tournaments and their schedules
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tournaments..."
            className="w-full bg-slate-800/70 border border-slate-700/60 text-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-green-500/60 focus:ring-2 focus:ring-green-500/20 transition-all"
          />
        </div>

        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Loading tournaments..." className="text-center" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <p className="text-5xl mb-4">🏆</p>
            <h3 className="text-lg font-semibold text-white mb-2">No tournaments found</h3>
            <p className="text-slate-400 text-sm">
              {search ? 'Try a different search' : 'No active tournaments yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => (
  <Link
    to={`/tournament/${tournament.id}`}
    className="block glass-card rounded-2xl overflow-hidden card-hover group"
  >
    <div className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500" />
    <div className="p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/20 flex items-center justify-center text-3xl shrink-0">
          🏆
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base truncate group-hover:text-green-400 transition-colors">
            {tournament.name}
          </h3>
          <span className="text-xs text-slate-400 font-medium">{tournament.format}</span>
          {tournament.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tournament.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {tournament.location && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin size={12} />
            <span className="truncate">{tournament.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar size={12} />
          <span>
            {formatDate(tournament.startDate)}
            {tournament.endDate && ` – ${formatDate(tournament.endDate)}`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Users size={12} />
          <span>{tournament.teams.length} teams</span>
        </div>
      </div>

      {tournament.prizePool && (
        <div className="mt-3 pt-3 border-t border-slate-700/40">
          <span className="text-xs text-yellow-400 font-medium">
            🏅 Prize Pool: {tournament.prizePool}
          </span>
        </div>
      )}
    </div>
  </Link>
);
