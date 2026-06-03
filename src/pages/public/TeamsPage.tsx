import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useTeams } from '@/hooks/useTeamPlayer';
import { Users, Search } from 'lucide-react';

export default function TeamsPage() {
  const { teams, loading } = useTeams();
  const [search, setSearch] = useState('');

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold">Teams</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search teams..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="shimmer h-36 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No teams found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(team => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  {team.logoUrl ? (
                    <img src={team.logoUrl} alt={team.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-primary" />
                  )}
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{team.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{team.playerCount || 0} players</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
