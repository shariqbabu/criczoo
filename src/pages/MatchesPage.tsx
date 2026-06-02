import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import {
  subscribeToLiveMatches,
  getUpcomingMatches,
  getRecentMatches,
} from '../services/matchService';
import { LiveMatchCard } from '../components/match/LiveMatchCard';
import { UpcomingMatchCard } from '../components/match/UpcomingMatchCard';
import { CompletedMatchCard } from '../components/match/CompletedMatchCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Match, MatchFormat } from '../types';
import { cn } from '../lib/utils';

type Tab = 'live' | 'upcoming' | 'completed';
const tabs: { id: Tab; label: string }[] = [
  { id: 'live', label: '🔴 Live' },
  { id: 'upcoming', label: '📅 Upcoming' },
  { id: 'completed', label: '✅ Results' },
];
const formats: MatchFormat[] = ['T20', 'ODI', 'Test', 'T10'];

export const MatchesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = (searchParams.get('tab') as Tab) ?? 'live';
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState<MatchFormat | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubLive = subscribeToLiveMatches(setLiveMatches);
    Promise.all([getUpcomingMatches(), getRecentMatches()]).then(
      ([upcoming, recent]) => {
        setUpcomingMatches(upcoming);
        setRecentMatches(recent);
        setLoading(false);
      }
    ).catch(() => setLoading(false));
    return () => { unsubLive(); };
  }, []);

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setSearchParams({ tab: t });
  };

  const filter = (matches: Match[]) => {
    let res = matches;
    if (search) {
      const s = search.toLowerCase();
      res = res.filter(
        (m) =>
          m.teamA.name.toLowerCase().includes(s) ||
          m.teamB.name.toLowerCase().includes(s) ||
          m.venue.toLowerCase().includes(s) ||
          m.title.toLowerCase().includes(s)
      );
    }
    if (formatFilter) {
      res = res.filter((m) => m.format === formatFilter);
    }
    return res;
  };

  const currentMatches =
    tab === 'live'
      ? filter(liveMatches)
      : tab === 'upcoming'
      ? filter(upcomingMatches)
      : filter(recentMatches);

  return (
    <div className="min-h-screen hero-bg pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-white mb-1"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Matches
          </h1>
          <p className="text-slate-400 text-sm">
            Track live scores, upcoming fixtures, and completed results
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl mb-5 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={cn(
                'px-5 py-2 text-sm font-medium rounded-lg transition-all',
                tab === t.id
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {t.label}
              {t.id === 'live' && liveMatches.length > 0 && (
                <span className="ml-1.5 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                  {liveMatches.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams, venue..."
              className="w-full bg-slate-800/70 border border-slate-700/60 text-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-green-500/60 focus:ring-2 focus:ring-green-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-slate-500 shrink-0" />
            {formats.map((f) => (
              <button
                key={f}
                onClick={() => setFormatFilter(formatFilter === f ? '' : f)}
                className={cn(
                  'px-3 py-2 text-xs font-medium rounded-lg border transition-all',
                  formatFilter === f
                    ? 'bg-green-500/20 border-green-500/40 text-green-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Loading matches..." className="text-center" />
          </div>
        ) : currentMatches.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <p className="text-5xl mb-4">
              {tab === 'live' ? '🏏' : tab === 'upcoming' ? '📅' : '📋'}
            </p>
            <h3 className="text-lg font-semibold text-white mb-2">
              {search ? 'No matches found' : `No ${tab} matches`}
            </h3>
            <p className="text-slate-400 text-sm">
              {search ? 'Try a different search term' : 'Check back later'}
            </p>
          </div>
        ) : tab === 'live' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMatches.map((m) => (
              <LiveMatchCard key={m.id} match={m} />
            ))}
          </div>
        ) : tab === 'upcoming' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMatches.map((m) => (
              <UpcomingMatchCard key={m.id} match={m} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentMatches.map((m) => (
              <CompletedMatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
