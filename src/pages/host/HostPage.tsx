import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useHostStats } from '@/hooks/useMatch';
import { Trophy, Users, Activity, Plus, ChevronRight } from 'lucide-react';

export default function HostDashboard() {
  const { profile: userProfile } = useAuth();
  const { stats, recentMatches, loading } = useHostStats();

  const quickLinks = [
    { to: '/host/matches/create', label: 'New Match', icon: Activity, color: 'bg-green-100 text-green-700' },
    { to: '/host/teams/create', label: 'New Team', icon: Users, color: 'bg-blue-100 text-blue-700' },
    { to: '/host/players/create', label: 'New Player', icon: Users, color: 'bg-purple-100 text-purple-700' },
    { to: '/host/tournaments/create', label: 'New Tournament', icon: Trophy, color: 'bg-yellow-100 text-yellow-700' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Host Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {userProfile?.name || 'Host'}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Matches', value: stats?.totalMatches || 0, icon: Activity },
            { label: 'Live Matches', value: stats?.liveMatches || 0, icon: Activity },
            { label: 'Teams', value: stats?.totalTeams || 0, icon: Users },
            { label: 'Players', value: stats?.totalPlayers || 0, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-border p-5">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{loading ? '—' : value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinks.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 bg-white rounded-xl border border-border p-4 hover:shadow-md transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Manage links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Matches', to: '/host/matches', desc: 'View and manage all your matches' },
            { title: 'Teams', to: '/host/teams', desc: 'Manage your cricket teams' },
            { title: 'Players', to: '/host/players', desc: 'Manage player rosters and stats' },
            { title: 'Tournaments', to: '/host/tournaments', desc: 'Create and manage tournaments' },
          ].map(({ title, to, desc }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-between bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group"
            >
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
                  }
