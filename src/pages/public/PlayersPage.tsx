import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { usePlayers } from '@/hooks/useTeamPlayer';
import { User, Search } from 'lucide-react';

export default function PlayersPage() {
  const { players, loading } = usePlayers();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const roles = ['all', 'batsman', 'bowler', 'all-rounder', 'wicket-keeper'];

  const filtered = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Players</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
            />
          </div>
        </div>

        {/* Role filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                roleFilter === role
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="shimmer h-40 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No players found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(player => (
              <Link
                key={player.id}
                to={`/players/${player.id}`}
                className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  {player.photoUrl ? (
                    <img src={player.photoUrl} alt={player.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{player.name}</h3>
                <p className="text-xs text-muted-foreground capitalize mt-1">{player.role}</p>
                {player.teamName && (
                  <p className="text-xs text-primary mt-1">{player.teamName}</p>
                )}
                <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Runs: <strong className="text-foreground">{player.stats?.totalRuns || 0}</strong></span>
                  <span>Wkts: <strong className="text-foreground">{player.stats?.totalWickets || 0}</strong></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
