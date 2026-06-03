import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { useLeaderboard } from '@/hooks/useMatch';
import { TrendingUp, User } from 'lucide-react';

type Tab = 'batting' | 'bowling';

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('batting');
  const { batters, bowlers, loading } = useLeaderboard();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Leaderboards</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg mb-6 w-fit">
          {(['batting', 'bowling'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                tab === t ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="shimmer h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Player</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Team</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    {tab === 'batting' ? 'Runs' : 'Wickets'}
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    {tab === 'batting' ? 'Avg' : 'Economy'}
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    {tab === 'batting' ? 'SR' : 'Best'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(tab === 'batting' ? batters : bowlers).map((entry, i) => (
                  <tr key={entry.playerId} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/players/${entry.playerId}`} className="flex items-center gap-2 hover:text-primary">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {entry.photoUrl ? (
                            <img src={entry.photoUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                          ) : (
                            <User className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className="font-medium">{entry.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{entry.teamName}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary">
                      {tab === 'batting' ? entry.runs : entry.wickets}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                      {tab === 'batting' ? entry.avg?.toFixed(1) : entry.economy?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                      {tab === 'batting' ? entry.strikeRate?.toFixed(1) : entry.bestBowling}
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
