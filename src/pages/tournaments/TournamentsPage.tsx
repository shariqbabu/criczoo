import { motion } from 'framer-motion';
import { Trophy, Search } from 'lucide-react';
import { useState } from 'react';
import { useTournaments } from '../../hooks/useTournaments';
import { TournamentCard } from '../../components/cricket/TournamentCard';
import { StatCardSkeleton } from '../../components/ui/Skeleton';

export default function TournamentsPage() {
  const { data: tournaments, isLoading } = useTournaments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = (tournaments || []).filter(t => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.location.toLowerCase().includes(q) || t.organizer.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tournaments</h1>
          <p className="text-gray-400">Cricket tournaments and leagues</p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tournaments..."
              className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {['', 'upcoming', 'live', 'completed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  statusFilter === s ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Trophy size={48} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400">No tournaments found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <TournamentCard tournament={t} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
