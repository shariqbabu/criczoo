import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Trophy, Users, ChevronRight, Zap, Shield, BarChart3, Play } from 'lucide-react';
import { useMatches } from '../hooks/useMatches';
import { useTournaments } from '../hooks/useTournaments';
import { MatchCard } from '../components/cricket/MatchCard';
import { TournamentCard } from '../components/cricket/TournamentCard';
import { MatchCardSkeleton, StatCardSkeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function StatCounter({ end, label, suffix = '' }: { end: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000;
    const step = end / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-white">{count}{suffix}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const { matches: liveMatches, loading: liveLoading } = useMatches({ status: 'live' });
  const { matches: upcomingMatches, loading: upcomingLoading } = useMatches({ status: 'upcoming' });
  const { data: tournaments, isLoading: tournamentsLoading } = useTournaments();

  const features = [
    { icon: <Activity className="text-emerald-400" size={24} />, title: 'Live Scoring', desc: 'Real-time ball-by-ball scoring with live updates' },
    { icon: <Trophy className="text-yellow-400" size={24} />, title: 'Tournament Management', desc: 'Complete tournament ecosystem with brackets' },
    { icon: <BarChart3 className="text-blue-400" size={24} />, title: 'Advanced Statistics', desc: 'In-depth player and team analytics' },
    { icon: <Shield className="text-purple-400" size={24} />, title: 'Role-Based Access', desc: 'Secure guest, user, host, and admin roles' },
    { icon: <Zap className="text-orange-400" size={24} />, title: 'Instant Updates', desc: 'Firestore real-time listeners for instant data' },
    { icon: <Users className="text-pink-400" size={24} />, title: 'Community', desc: 'Follow teams, comment, and engage' },
  ];

  return (
    <div className="bg-gray-950 min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-950 pt-16 pb-20">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <Badge variant="success" size="md" pulse>
                🔴 Live Matches Available
              </Badge>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6">
              Cricket Live
              <span className="block bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                Scoring & Management
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Real-time ball-by-ball scoring, complete tournament management, advanced statistics, 
              and a full cricket ecosystem for hosts, players, and fans.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/matches"
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105"
              >
                <Play size={20} />
                Watch Live Matches
              </Link>
              <Link
                to="/host/register"
                className="flex items-center gap-2 rounded-2xl border border-gray-600 px-8 py-4 text-lg font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
              >
                Become a Host
                <ChevronRight size={20} />
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
              <StatCounter end={1200} label="Matches Played" suffix="+" />
              <StatCounter end={350} label="Active Teams" suffix="+" />
              <StatCounter end={85} label="Tournaments" suffix="+" />
              <StatCounter end={15000} label="Cricket Fans" suffix="+" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live Matches */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
                Live Matches
              </h2>
              <p className="text-gray-500 text-sm mt-1">Happening right now</p>
            </div>
            <Link to="/matches?status=live" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm font-medium">
              View all <ChevronRight size={16} />
            </Link>
          </div>

          {liveLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <MatchCardSkeleton key={i} />)}
            </div>
          ) : liveMatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-700 py-12 text-center">
              <Activity size={40} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-500">No live matches right now</p>
              <Link to="/matches?status=upcoming" className="mt-2 inline-block text-sm text-emerald-400 hover:text-emerald-300">
                View upcoming matches →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveMatches.slice(0, 6).map((match, i) => (
                <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <MatchCard match={match} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Matches */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Upcoming Matches</h2>
              <p className="text-gray-500 text-sm mt-1">Schedule your plans</p>
            </div>
            <Link to="/matches?status=upcoming" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm font-medium">
              View all <ChevronRight size={16} />
            </Link>
          </div>

          {upcomingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map(i => <MatchCardSkeleton key={i} />)}
            </div>
          ) : upcomingMatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-700 py-8 text-center">
              <p className="text-gray-500">No upcoming matches scheduled</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMatches.slice(0, 3).map((match, i) => (
                <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <MatchCard match={match} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tournaments */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Active Tournaments</h2>
              <p className="text-gray-500 text-sm mt-1">Compete for glory</p>
            </div>
            <Link to="/tournaments" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm font-medium">
              View all <ChevronRight size={16} />
            </Link>
          </div>

          {tournamentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
            </div>
          ) : !tournaments || tournaments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-700 py-12 text-center">
              <Trophy size={40} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-500">No tournaments yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.slice(0, 6).map((tournament, i) => (
                <motion.div key={tournament.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <TournamentCard tournament={tournament} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-gray-400 max-w-xl mx-auto">A complete cricket ecosystem built for the modern age</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-gray-700/50 bg-gray-900/50 p-6 hover:border-emerald-500/30 transition-colors"
              >
                <div className="mb-4 w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/20 p-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Scoring?</h2>
            <p className="text-gray-400 mb-8">Join thousands of cricket enthusiasts and hosts managing matches on CricketPro</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="rounded-2xl bg-emerald-500 px-8 py-3.5 font-semibold text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">
                Get Started Free
              </Link>
              <Link to="/matches" className="rounded-2xl border border-gray-600 px-8 py-3.5 font-semibold text-gray-300 hover:bg-white/5 transition-colors">
                Browse Matches
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
