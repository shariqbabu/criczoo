import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Activity,
  Zap,
  ChevronRight,
  Users,
  Globe,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import {
  subscribeToLiveMatches,
  getUpcomingMatches,
  getRecentMatches,
} from '../services/matchService';
import { getActiveTournaments } from '../services/tournamentService';
import { LiveMatchCard } from '../components/match/LiveMatchCard';
import { UpcomingMatchCard } from '../components/match/UpcomingMatchCard';
import { CompletedMatchCard } from '../components/match/CompletedMatchCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { Match, Tournament } from '../types';
import { formatDate } from '../lib/utils';

export const HomePage: React.FC = () => {
  const { user, isHost } = useAuth();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubLive = subscribeToLiveMatches(setLiveMatches);

  const loadData = async () => {
    try {
      const upcoming = await getUpcomingMatches();
      console.log("UPCOMING:", upcoming);
      setUpcomingMatches(upcoming);

      const recent = await getRecentMatches();
      console.log("RECENT:", recent);
      setRecentMatches(recent);

      const tours = await getActiveTournaments();
      console.log("TOURS:", tours);
      setTournaments(tours);
    } catch (err) {
      console.error("HOME ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  loadData();

  return () => {
    unsubLive();
  };
}, []);

  return (
    <div className="min-h-screen hero-bg">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-400 font-medium mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full live-pulse" />
            Live Cricket Scoring Platform
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Score. Stream.{' '}
            <span className="gradient-text">Celebrate.</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            The ultimate platform for live cricket scoring. Host matches, track tournaments,
            and share real-time scores with fans worldwide.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <>
                {isHost && (
                  <Link
                    to="/host"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-900/40 neon-glow"
                  >
                    <Activity size={18} />
                    Host Dashboard
                    <ArrowRight size={16} />
                  </Link>
                )}
                <Link
                  to="/matches"
                  className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all"
                >
                  <Zap size={18} />
                  View Live Matches
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-900/40 neon-glow"
                >
                  Start Hosting
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/matches"
                  className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all"
                >
                  <Activity size={18} />
                  Live Scores
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-12">
            {[
              { label: 'Live Matches', value: liveMatches.length.toString(), icon: '🔴' },
              { label: 'Upcoming', value: upcomingMatches.length.toString(), icon: '📅' },
              { label: 'Tournaments', value: tournaments.length.toString(), icon: '🏆' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20 space-y-12">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Loading matches..." className="text-center" />
          </div>
        ) : (
          <>
            {/* Live Matches */}
            {liveMatches.length > 0 && (
              <section>
                <SectionHeader
                  title="Live Now"
                  icon={<span className="w-2.5 h-2.5 bg-red-500 rounded-full live-pulse" />}
                  to="/matches?tab=live"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveMatches.map((m) => (
                    <LiveMatchCard key={m.id} match={m} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty live state */}
            {liveMatches.length === 0 && (
              <section className="glass-card rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">🏏</div>
                <h3 className="text-lg font-semibold text-white mb-2">No Live Matches</h3>
                <p className="text-slate-400 text-sm mb-4">
                  No matches are live right now. Check back soon or view upcoming matches.
                </p>
                <Link
                  to="/matches"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl text-sm font-medium hover:bg-green-500/25 transition-all"
                >
                  Browse All Matches <ChevronRight size={14} />
                </Link>
              </section>
            )}

            {/* Upcoming */}
            {upcomingMatches.length > 0 && (
              <section>
                <SectionHeader title="Upcoming Matches" icon={<Calendar size={18} className="text-blue-400" />} to="/matches?tab=upcoming" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingMatches.slice(0, 6).map((m) => (
                    <UpcomingMatchCard key={m.id} match={m} />
                  ))}
                </div>
              </section>
            )}

            {/* Tournaments */}
            {tournaments.length > 0 && (
              <section>
                <SectionHeader
                  title="Active Tournaments"
                  icon={<Trophy size={18} className="text-yellow-400" />}
                  to="/tournaments"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournaments.slice(0, 3).map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                  ))}
                </div>
              </section>
            )}

            {/* Recent Results */}
            {recentMatches.length > 0 && (
              <section>
                <SectionHeader
                  title="Recent Results"
                  icon={<Activity size={18} className="text-slate-400" />}
                  to="/matches?tab=completed"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recentMatches.slice(0, 6).map((m) => (
                    <CompletedMatchCard key={m.id} match={m} />
                  ))}
                </div>
              </section>
            )}

            {/* Feature Cards */}
            <section>
              <h2 className="text-xl font-bold text-white mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
                Why CricZoo
                ?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: '⚡',
                    title: 'Real-time Scores',
                    desc: 'Ball-by-ball updates powered by Firebase Firestore for instant delivery.',
                    color: 'from-yellow-500/10 to-orange-500/5 border-yellow-500/15',
                  },
                  {
                    icon: '🌐',
                    title: 'Share Anywhere',
                    desc: 'Share your match link and let fans follow live from anywhere in the world.',
                    color: 'from-blue-500/10 to-cyan-500/5 border-blue-500/15',
                  },
                  {
                    icon: '📊',
                    title: 'Rich Scorecards',
                    desc: 'Detailed batting, bowling, and commentary for every match you host.',
                    color: 'from-green-500/10 to-emerald-500/5 border-green-500/15',
                  },
                  {
                    icon: '🏆',
                    title: 'Tournament Mode',
                    desc: 'Manage entire tournaments with bracket, standings, and team statistics.',
                    color: 'from-purple-500/10 to-violet-500/5 border-purple-500/15',
                  },
                  {
                    icon: '📱',
                    title: 'Mobile First',
                    desc: 'Score from your phone on the field with our responsive design.',
                    color: 'from-pink-500/10 to-rose-500/5 border-pink-500/15',
                  },
                  {
                    icon: '🔒',
                    title: 'Secure & Reliable',
                    desc: 'Firebase auth & Firestore ensure your data is safe and always available.',
                    color: 'from-slate-500/10 to-slate-600/5 border-slate-500/15',
                  },
                ].map((f) => (
                  <div
                    key={f.title}
                    className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${f.color} border card-hover`}
                  >
                    <div className="text-3xl mb-3">{f.icon}</div>
                    <h3 className="text-base font-semibold text-white mb-1">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            {!user && (
              <section className="glass-card rounded-2xl p-8 sm:p-12 text-center bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/15">
                <div className="max-w-lg mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Users size={24} className="text-green-400" />
                    <Globe size={24} className="text-blue-400" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Ready to Host Your First Match?
                  </h2>
                  <p className="text-slate-400 mb-6">
                    Join hundreds of scorers already using CricZoo. Free to use, no credit card required.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-900/40 neon-glow"
                  >
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{
  title: string;
  icon: React.ReactNode;
  to: string;
}> = ({ title, icon, to }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="flex items-center gap-2 text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
      {icon}
      {title}
    </h2>
    <Link
      to={to}
      className="flex items-center gap-1 text-xs text-slate-400 hover:text-green-400 transition-colors"
    >
      View all <ChevronRight size={14} />
    </Link>
  </div>
);

const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => (
  <Link
    to={`/tournament/${tournament.id}`}
    className="block glass-card rounded-2xl p-5 card-hover group"
  >
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/20 flex items-center justify-center text-2xl shrink-0">
        🏆
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm truncate">{tournament.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{tournament.description}</p>
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
      <span>{tournament.teams.length} teams</span>
      <span>{formatDate(tournament.startDate)}</span>
    </div>
  </Link>
);
