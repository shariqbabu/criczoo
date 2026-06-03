import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { useTournaments } from '@/hooks/useMatch';
import { Trophy, Search, Calendar } from 'lucide-react';

export default function TournamentsPage() {
  const { tournaments, loading } = useTournaments();
  const [search, setSearch] = useState('');

  const filtered = tournaments.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold">Tournaments</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="shimmer h-48 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tournaments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(t => (
              <Link
                key={t.id}
                to={`/tournaments/${t.id}`}
                className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors mb-2">{t.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <Calendar className="w-3 h-3" />
                  {t.startDate ? new Date(t.startDate).toLocaleDateString() : 'TBD'}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.teamCount || 0} teams</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    t.status === 'live' ? 'bg-red-100 text-red-600' :
                    t.status === 'upcoming' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {t.status || 'upcoming'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
