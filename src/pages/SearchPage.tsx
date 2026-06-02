import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, Trophy, Users, User } from 'lucide-react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Match, Tournament, Team, Player } from '../types';
import { StatusBadge } from '../components/ui/Badge';

type SearchResults = {
  matches: Match[];
  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
};

const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ matches: [], tournaments: [], teams: [], players: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setResults({ matches: [], tournaments: [], teams: [], players: [] }); setSearched(false); return; }
      setLoading(true);
      setSearched(true);
      try {
        const [matchSnap, tourSnap, teamSnap, playerSnap] = await Promise.all([
          getDocs(query(collection(db, 'matches'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'teams'), orderBy('name', 'asc'))),
          getDocs(query(collection(db, 'players'), orderBy('name', 'asc'))),
        ]);

        const qLower = q.toLowerCase();
        setResults({
          matches: matchSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Match))
            .filter(m => m.teamA.name.toLowerCase().includes(qLower) || m.teamB.name.toLowerCase().includes(qLower) || m.venue.toLowerCase().includes(qLower)),
          tournaments: tourSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Tournament))
            .filter(t => t.name.toLowerCase().includes(qLower) || t.location.toLowerCase().includes(qLower)),
          teams: teamSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Team))
            .filter(t => t.name.toLowerCase().includes(qLower) || t.shortName?.toLowerCase().includes(qLower)),
          players: playerSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Player))
            .filter(p => p.name.toLowerCase().includes(qLower)),
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 500) as unknown as (q: string) => void,
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    performSearch(val);
  };

  const totalResults = results.matches.length + results.tournaments.length + results.teams.length + results.players.length;

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Search CricketPro</h1>
          <p className="text-gray-400">Find matches, tournaments, teams, and players</p>
        </motion.div>

        {/* Search Input */}
        <div className="relative mb-8">
          <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search matches, teams, players, tournaments..."
            autoFocus
            className="w-full rounded-2xl border border-gray-700 bg-gray-800/50 py-4 pl-14 pr-5 text-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {loading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <div className="h-5 w-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        {/* Results */}
        <AnimatePresence>
          {searched && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {totalResults === 0 && !loading && (
                <div className="py-12 text-center text-gray-500">
                  <Search size={40} className="mx-auto mb-4 text-gray-700" />
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}

              {/* Matches */}
              {results.matches.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    <Activity size={14} />
                    Matches ({results.matches.length})
                  </h2>
                  <div className="space-y-2">
                    {results.matches.map(m => (
                      <Link key={m.id} to={`/matches/${m.id}`} className="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 hover:border-emerald-500/40 transition-colors">
                        <div>
                          <p className="text-white font-medium">{m.teamA.name} vs {m.teamB.name}</p>
                          <p className="text-sm text-gray-500">{m.venue} · {m.format}</p>
                        </div>
                        <StatusBadge status={m.status} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tournaments */}
              {results.tournaments.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    <Trophy size={14} />
                    Tournaments ({results.tournaments.length})
                  </h2>
                  <div className="space-y-2">
                    {results.tournaments.map(t => (
                      <Link key={t.id} to={`/tournaments/${t.id}`} className="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 hover:border-emerald-500/40 transition-colors">
                        <div>
                          <p className="text-white font-medium">{t.name}</p>
                          <p className="text-sm text-gray-500">{t.location} · {t.organizer}</p>
                        </div>
                        <StatusBadge status={t.status} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams */}
              {results.teams.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    <Users size={14} />
                    Teams ({results.teams.length})
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {results.teams.map(t => (
                      <div key={t.id} className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3">
                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                          {t.logoURL ? <img src={t.logoURL} alt="" className="h-full w-full object-cover" /> : <span className="text-sm font-bold text-gray-300">{t.shortName}</span>}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.players?.length || 0} players</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Players */}
              {results.players.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    <User size={14} />
                    Players ({results.players.length})
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {results.players.map(p => (
                      <div key={p.id} className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3">
                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                          {p.photoURL ? <img src={p.photoURL} alt="" className="h-full w-full object-cover" /> : <User size={18} className="text-gray-400" />}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{p.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions when no query */}
        {!searchQuery && (
          <div className="text-center py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[
                { icon: <Activity size={20} />, label: 'Live Matches', to: '/matches?status=live' },
                { icon: <Trophy size={20} />, label: 'Tournaments', to: '/tournaments' },
                { icon: <Users size={20} />, label: 'Teams', to: '/matches' },
                { icon: <User size={20} />, label: 'Players', to: '/matches' },
              ].map(s => (
                <Link key={s.label} to={s.to} className="flex flex-col items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 p-4 hover:border-emerald-500/40 hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
                  {s.icon}
                  <span className="text-xs">{s.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
