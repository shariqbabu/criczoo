import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { queryDocs, Collections } from '@/lib/firestore';
import { orderBy, limit } from 'firebase/firestore';
import { Activity, Search, Eye } from 'lucide-react';
import type { Match } from '@/types';

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    queryDocs<Match>(Collections.MATCHES, [orderBy('createdAt', 'desc'), limit(200)])
      .then(setMatches)
      .finally(() => setLoading(false));
  }, []);

  const filtered = matches.filter(m => {
    const matchesFilter = filter === 'all' || m.status === filter;
    const matchesSearch = !search || m.teamA?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.teamB?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusColor = (s: string) =>
    s === 'live' ? 'bg-red-100 text-red-600' :
    s === 'completed' ? 'bg-gray-100 text-gray-600' :
    s === 'upcoming' ? 'bg-blue-100 text-blue-700' :
    'bg-orange-100 text-orange-700';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">All Matches</h1>
          <span className="text-sm text-muted-foreground">{matches.length} total</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by team name..."
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex gap-2">
            {(['all','live','upcoming','completed'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === f ? 'bg-primary text-white' : 'border border-border hover:bg-muted'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="shimmer h-16 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No matches found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Match</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Format</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Host</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">View</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(match => (
                  <tr key={match.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {match.teamA?.name} <span className="text-muted-foreground">vs</span> {match.teamB?.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{match.format}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(match.status)}`}>
                        {match.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{match.hostName}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/matches/${match.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 border border-border rounded-lg text-xs hover:bg-muted transition-colors">
                        <Eye className="w-3 h-3" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
