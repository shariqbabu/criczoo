import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Trophy, ListOrdered } from 'lucide-react';
import { useTournament } from '../../hooks/useTournaments';
import { useMatches } from '../../hooks/useMatches';
import { StatusBadge } from '../../components/ui/Badge';
import { MatchCard } from '../../components/cricket/MatchCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { format } from 'date-fns';

export default function TournamentDetailPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { data: tournament, isLoading } = useTournament(tournamentId || '');
  const { matches } = useMatches({ tournamentId: tournamentId || '' });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 p-4">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Tournament not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-emerald-900/50 to-blue-900/50">
        {tournament.bannerURL ? (
          <img src={tournament.bannerURL} alt={tournament.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Trophy size={64} className="text-emerald-500/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <StatusBadge status={tournament.status} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-4">{tournament.name}</h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin size={16} className="text-emerald-400" />
              {tournament.location}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar size={16} className="text-blue-400" />
              {tournament.startDate ? format(new Date(tournament.startDate), 'MMM d') : ''} – {tournament.endDate ? format(new Date(tournament.endDate), 'MMM d, yyyy') : ''}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users size={16} className="text-purple-400" />
              {tournament.teams?.length || 0} Teams
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Trophy size={16} className="text-yellow-400" />
              {tournament.organizer}
            </div>
          </div>

          {tournament.rules && (
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5 mb-8">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ListOrdered size={16} />
                Rules & Regulations
              </h3>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{tournament.rules}</p>
            </div>
          )}

          {/* Points Table */}
          {tournament.pointsTable && tournament.pointsTable.length > 0 && (
            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white">Points Table</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/60">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-400">#</th>
                      <th className="text-left px-4 py-3 text-gray-400">Team</th>
                      <th className="text-right px-3 py-3 text-gray-400">P</th>
                      <th className="text-right px-3 py-3 text-gray-400">W</th>
                      <th className="text-right px-3 py-3 text-gray-400">L</th>
                      <th className="text-right px-3 py-3 text-gray-400">T</th>
                      <th className="text-right px-3 py-3 text-gray-400">NRR</th>
                      <th className="text-right px-3 py-3 text-gray-400">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {tournament.pointsTable.map((entry, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                        <td className="px-4 py-3 text-white font-medium">{entry.teamName}</td>
                        <td className="text-right px-3 py-3 text-gray-400">{entry.played}</td>
                        <td className="text-right px-3 py-3 text-emerald-400">{entry.won}</td>
                        <td className="text-right px-3 py-3 text-red-400">{entry.lost}</td>
                        <td className="text-right px-3 py-3 text-gray-400">{entry.tied}</td>
                        <td className="text-right px-3 py-3 text-gray-400">{entry.nrr.toFixed(3)}</td>
                        <td className="text-right px-3 py-3 font-bold text-white">{entry.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Matches */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Tournament Matches ({matches.length})</h2>
            {matches.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-700 py-10 text-center text-gray-500">
                No matches scheduled yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
