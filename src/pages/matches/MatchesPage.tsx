import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Activity, Search } from 'lucide-react';
import { useMatches } from '../../hooks/useMatches';
import { MatchCard } from '../../components/cricket/MatchCard';
import { MatchCardSkeleton } from '../../components/ui/Skeleton';

const filters = [
  { key: '', label: 'All Matches' },
  { key: 'live', label: '🔴 Live' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

const formatFilters = [
  { key: '', label: 'All Formats' },
  { key: 'T10', label: 'T10' },
  { key: 'T20', label: 'T20' },
  { key: 'ODI', label: 'ODI' },
  { key: 'Test', label: 'Test' },
];

export default function MatchesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [search, setSearch] = useState('');

  const { matches, loading } = useMatches({ status: statusFilter || undefined });

  const filtered = matches.filter(m => {
    if (formatFilter && m.format !== formatFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.teamA.name.toLowerCase().includes(q) ||
        m.teamB.name.toLowerCase().includes(q) ||
        m.venue.toLowerCase().includes(q) ||
        m.tournamentName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Matches</h1>
          <p className="text-gray-400">Live, upcoming, and completed cricket matches</p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search teams, venues, tournaments..."
              className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter size={16} className="text-gray-500 flex-shrink-0" />
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  statusFilter === f.key
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className="w-px h-6 bg-gray-700 mx-2" />
            {formatFilters.map(f => (
              <button
                key={f.key}
                onClick={() => setFormatFilter(f.key)}
                className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  formatFilter === f.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500 mb-4">
          {loading ? 'Loading...' : `${filtered.length} match${filtered.length !== 1 ? 'es' : ''} found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <MatchCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Activity size={48} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400">No matches found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <MatchCard match={match} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
