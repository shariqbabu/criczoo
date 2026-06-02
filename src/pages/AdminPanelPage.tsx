import React, { useEffect, useState } from 'react';
import { Shield, Users, Activity, Trophy, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCollection } from '../firebase/firestore';
import { COLLECTIONS } from '../firebase/collections';
import { getLiveMatches, getUpcomingMatches, getRecentMatches } from '../services/matchService';
import { getActiveTournaments } from '../services/tournamentService';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { AppUser, Match, Tournament } from '../types';
import { formatDateTime } from '../lib/utils';
import { Link } from 'react-router-dom';

export const AdminPanelPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [completedMatches, setCompletedMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'matches'>('overview');

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      getCollection<AppUser>(COLLECTIONS.USERS),
      getLiveMatches(),
      getUpcomingMatches(),
      getRecentMatches(),
      getActiveTournaments(),
    ]).then(([u, live, upcoming, completed, tours]) => {
      setUsers(u);
      setLiveMatches(live);
      setUpcomingMatches(upcoming);
      setCompletedMatches(completed);
      setTournaments(tours);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen hero-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm">You don't have admin privileges</p>
          <Link to="/" className="mt-4 inline-block text-green-400 hover:text-green-300 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Activity },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'matches' as const, label: 'Matches', icon: Activity },
  ];

  return (
    <div className="min-h-screen hero-bg pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Shield size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Admin Panel
            </h1>
            <p className="text-slate-400 text-sm">Platform management & monitoring</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl mb-6 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === t.id
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Loading admin data..." className="py-20 text-center" />
        ) : activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: users.length, icon: <Users size={20} className="text-blue-400" />, color: 'from-blue-500/10' },
                { label: 'Live Matches', value: liveMatches.length, icon: <span className="text-red-400">🔴</span>, color: 'from-red-500/10' },
                { label: 'Upcoming', value: upcomingMatches.length, icon: <span>📅</span>, color: 'from-slate-500/10' },
                { label: 'Tournaments', value: tournaments.length, icon: <Trophy size={20} className="text-yellow-400" />, color: 'from-yellow-500/10' },
              ].map((s) => (
                <div key={s.label} className={`glass-card rounded-xl p-5 bg-gradient-to-br ${s.color} to-transparent`}>
                  <div className="flex items-center justify-between mb-2">{s.icon}</div>
                  <p className="text-3xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Role Distribution */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">User Roles</h3>
              <div className="grid grid-cols-3 gap-3">
                {(['admin', 'host', 'viewer'] as const).map((role) => {
                  const count = users.filter((u) => u.role === role).length;
                  return (
                    <div key={role} className="text-center p-3 bg-slate-800/40 rounded-xl">
                      <p className="text-xl font-bold text-white">{count}</p>
                      <p className="text-xs text-slate-400 capitalize mt-0.5">{role}s</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Matches */}
            {liveMatches.length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full live-pulse" />
                  Currently Live
                </h3>
                <div className="space-y-2">
                  {liveMatches.map((m) => (
                    <Link
                      key={m.id}
                      to={`/match/${m.id}`}
                      className="flex items-center gap-3 p-3 bg-slate-800/40 hover:bg-slate-700/40 rounded-xl transition-colors"
                    >
                      <Badge variant="live">LIVE</Badge>
                      <span className="text-sm text-slate-200 flex-1">{m.title}</span>
                      <span className="text-xs text-slate-500">{m.format}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'users' ? (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">
                All Users ({users.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-800/40">
              {users.map((u) => (
                <div key={u.uid} className="flex items-center gap-4 p-4 hover:bg-slate-800/20 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                    {(u.displayName ?? u.email ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{u.displayName ?? 'No Name'}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  <Badge variant={u.role === 'admin' ? 'purple' : u.role === 'host' ? 'green' : 'default'}>
                    {u.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {[...liveMatches, ...upcomingMatches, ...completedMatches].map((m) => (
              <div key={m.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                <Badge variant={m.status}>{m.status}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{m.title}</p>
                  <p className="text-xs text-slate-400">{m.venue} · {formatDateTime(m.scheduledAt)}</p>
                </div>
                <Link to={`/match/${m.id}`} className="text-xs text-green-400 hover:text-green-300">
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
