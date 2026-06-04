import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { usePlayer } from '@/hooks/useTeamPlayer';
import { ArrowLeft, User } from 'lucide-react';

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const { player, loading } = usePlayer(playerId!);

  if (loading) return <Layout><div className="max-w-3xl mx-auto px-4 py-8"><div className="shimmer h-48 rounded-xl" /></div></Layout>;

  if (!player) return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Player not found.</p>
        <Link to="/players" className="text-primary hover:underline text-sm mt-2 inline-block">Browse Players</Link>
      </div>
    </Layout>
  );

  const stats = player.stats || {};

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/players" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> All Players
        </Link>

        {/* Player card */}
        <div className="bg-white rounded-2xl border border-border p-8 mb-6 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {player.photoUrl ? (
              <img src={player.photoUrl} alt={player.name} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{player.name}</h1>
            <p className="text-muted-foreground capitalize text-sm mt-1">{player.role}</p>
            {player.teamName && (
              <Link to={`/teams/${player.teamId}`} className="text-primary text-sm hover:underline mt-1 inline-block">
                {player.teamName}
              </Link>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Matches', value: stats.matches || 0 },
            { label: 'Runs', value: stats.totalRuns || 0 },
            { label: 'Wickets', value: stats.totalWickets || 0 },
            { label: 'Avg', value: stats.battingAvg?.toFixed(1) || '0.0' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Batting stats */}
        <div className="bg-white rounded-xl border border-border p-6 mb-4">
          <h2 className="font-semibold mb-4">Batting Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div><span className="text-muted-foreground">Highest Score</span><p className="font-medium mt-0.5">{stats.highestScore || 0}</p></div>
            <div><span className="text-muted-foreground">Strike Rate</span><p className="font-medium mt-0.5">{stats.strikeRate?.toFixed(1) || '0.0'}</p></div>
            <div><span className="text-muted-foreground">50s / 100s</span><p className="font-medium mt-0.5">{stats.fifties || 0} / {stats.hundreds || 0}</p></div>
          </div>
        </div>

        {/* Bowling stats */}
        {(player.role === 'bowler' || player.role === 'all-rounder') && (
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Bowling Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div><span className="text-muted-foreground">Wickets</span><p className="font-medium mt-0.5">{stats.totalWickets || 0}</p></div>
              <div><span className="text-muted-foreground">Economy</span><p className="font-medium mt-0.5">{stats.economy?.toFixed(2) || '0.00'}</p></div>
              <div><span className="text-muted-foreground">Best Bowling</span><p className="font-medium mt-0.5">{stats.bestBowling || '0/0'}</p></div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
