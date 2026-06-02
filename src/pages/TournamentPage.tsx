import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, MapPin, Calendar, Users, ChevronLeft } from 'lucide-react';
import { getTournament } from '../services/tournamentService';
import { getHostMatches } from '../services/matchService';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CompletedMatchCard } from '../components/match/CompletedMatchCard';
import { UpcomingMatchCard } from '../components/match/UpcomingMatchCard';
import { LiveMatchCard } from '../components/match/LiveMatchCard';
import type { Tournament, Match } from '../types';
import { formatDate } from '../lib/utils';

export const TournamentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getTournament(id).then(async (t) => {
      setTournament(t);
      if (t) {
        const all = await getHostMatches(t.hostId);
        setMatches(all.filter((m) => m.tournamentId === id));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen hero-bg pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading tournament..." />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen hero-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🏆</p>
          <h2 className="text-xl font-bold text-white mb-2">Tournament not found</h2>
          <Link to="/tournaments" className="text-green-400 hover:text-green-300 text-sm">
            ← Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming');
  const completedMatches = matches.filter((m) => m.status === 'completed');

  return (
    <div className="min-h-screen hero-bg">
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-20">
        <div className="pt-4 mb-6">
          <Link
            to="/tournaments"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors mb-4"
          >
            <ChevronLeft size={16} />
            Tournaments
          </Link>

          {/* Header */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/20 flex items-center justify-center text-3xl shrink-0">
                🏆
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1
                      className="text-2xl font-bold text-white mb-1"
                      style={{ fontFamily: 'Syne, sans-serif' }}
                    >
                      {tournament.name}
                    </h1>
                    {tournament.description && (
                      <p className="text-slate-400 text-sm mb-3">{tournament.description}</p>
                    )}
                  </div>
                  <Badge variant={tournament.isActive ? 'live' : 'completed'}>
                    {tournament.isActive ? 'Active' : 'Ended'}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Trophy size={13} className="text-yellow-400" />
                    {tournament.format}
                  </div>
                  {tournament.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} />
                      {tournament.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {formatDate(tournament.startDate)}
                    {tournament.endDate && ` – ${formatDate(tournament.endDate)}`}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} />
                    {tournament.teams.length} teams
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Teams', value: tournament.teams.length, color: 'text-blue-400' },
              { label: 'Matches', value: matches.length, color: 'text-green-400' },
              { label: 'Completed', value: completedMatches.length, color: 'text-slate-400' },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Teams */}
          {tournament.teams.length > 0 && (
            <div className="glass-card rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Participating Teams</h3>
              <div className="flex flex-wrap gap-2">
                {tournament.teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700/40"
                  >
                    <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {team.shortName}
                    </div>
                    <span className="text-sm text-slate-300">{team.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Matches */}
          {liveMatches.length > 0 && (
            <section className="mb-6">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full live-pulse" />
                Live Now
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {liveMatches.map((m) => <LiveMatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcomingMatches.length > 0 && (
            <section className="mb-6">
              <h3 className="text-base font-bold text-white mb-3">Upcoming</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingMatches.map((m) => <UpcomingMatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}

          {/* Completed */}
          {completedMatches.length > 0 && (
            <section>
              <h3 className="text-base font-bold text-white mb-3">Results</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {completedMatches.map((m) => <CompletedMatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}

          {matches.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-slate-400">No matches scheduled yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
