import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Activity, Trophy, Users, Edit3, Play, Pause, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useHostMatches } from '../../hooks/useMatches';
import { useTournaments } from '../../hooks/useTournaments';
import { useTeams } from '../../hooks/useTeams';
import { useHostApplication } from '../../hooks/useHostApplications';
import { StatCard } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MatchCardSkeleton } from '../../components/ui/Skeleton';
import CreateMatchModal from './CreateMatchModal';
import CreateTournamentModal from './CreateTournamentModal';
import CreateTeamModal from './CreateTeamModal';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function HostDashboard() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  const { data: matches, isLoading: matchLoading } = useHostMatches(currentUser?.uid || '');
  const { data: tournaments, isLoading: tourLoading } = useTournaments(currentUser?.uid || '');
  const { data: teams } = useTeams(currentUser?.uid || '');
  const { data: application } = useHostApplication(currentUser?.uid || '');

  const isApproved = userProfile?.hostStatus === 'approved' || userProfile?.role === 'admin';
  const isPending = application?.status === 'pending';
  const isRejected = application?.status === 'rejected';

  const liveMatches = matches?.filter(m => m.status === 'live') || [];
  const upcomingMatches = matches?.filter(m => m.status === 'upcoming') || [];
  const completedMatches = matches?.filter(m => m.status === 'completed') || [];

  const toggleMatchStatus = async (matchId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'live' ? 'paused' : currentStatus === 'paused' ? 'live' : currentStatus;
      await updateDoc(doc(db, 'matches', matchId), { status: newStatus, updatedAt: serverTimestamp() });
      toast.success(`Match ${newStatus}`);
    } catch { toast.error('Failed to update match'); }
  };

  const startMatch = async (matchId: string) => {
    try {
      await updateDoc(doc(db, 'matches', matchId), { status: 'live', updatedAt: serverTimestamp() });
      toast.success('Match started!');
      navigate(`/matches/${matchId}`);
    } catch { toast.error('Failed to start match'); }
  };

  const endMatch = async (matchId: string) => {
    if (!confirm('End this match? This cannot be undone.')) return;
    try {
      await updateDoc(doc(db, 'matches', matchId), { status: 'completed', updatedAt: serverTimestamp() });
      toast.success('Match ended');
    } catch { toast.error('Failed to end match'); }
  };

  if (!isApproved && !userProfile?.role === 'admin' as unknown as boolean) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <div className="rounded-2xl border border-gray-700 bg-gray-900 p-8">
            {isPending ? (
              <>
                <Clock size={48} className="mx-auto text-yellow-400 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Application Under Review</h2>
                <p className="text-gray-400 mb-4">Your host application is being reviewed by our admin team. You'll be notified once approved.</p>
                <StatusBadge status="pending" />
              </>
            ) : isRejected ? (
              <>
                <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Application Rejected</h2>
                <p className="text-gray-400 mb-4">{application?.reviewNote || 'Your application was not approved. You may contact support.'}</p>
                <StatusBadge status="rejected" />
              </>
            ) : (
              <>
                <Trophy size={48} className="mx-auto text-gray-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Become a Host</h2>
                <p className="text-gray-400 mb-6">Apply to create and manage cricket tournaments</p>
                <Button onClick={() => navigate('/host/register')} size="lg">Apply as Host</Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Host Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back, {userProfile?.name}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowCreateTeam(true)} variant="ghost" icon={<Users size={16} />}>
              New Team
            </Button>
            <Button onClick={() => setShowCreateTournament(true)} variant="secondary" icon={<Trophy size={16} />}>
              New Tournament
            </Button>
            <Button onClick={() => setShowCreateMatch(true)} icon={<Plus size={16} />}>
              New Match
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Live Matches" value={liveMatches.length} icon={<Activity size={20} />} color="red" />
          <StatCard title="Upcoming" value={upcomingMatches.length} icon={<Clock size={20} />} color="blue" />
          <StatCard title="Completed" value={completedMatches.length} icon={<CheckCircle size={20} />} color="emerald" />
          <StatCard title="Teams" value={teams?.length || 0} icon={<Users size={20} />} color="purple" />
        </div>

        {/* Matches Management */}
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 overflow-hidden mb-8">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white">My Matches</h2>
            <Button size="sm" onClick={() => setShowCreateMatch(true)} icon={<Plus size={14} />}>Create</Button>
          </div>

          {matchLoading ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => <MatchCardSkeleton key={i} />)}
            </div>
          ) : !matches || matches.length === 0 ? (
            <div className="py-12 text-center">
              <Activity size={40} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-500">No matches yet. Create your first match!</p>
              <Button className="mt-4" size="sm" onClick={() => setShowCreateMatch(true)}>Create Match</Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {matches.map(match => (
                <div key={match.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={match.status} />
                      <span className="text-xs text-gray-500">{match.format}</span>
                    </div>
                    <p className="text-white font-medium">
                      {match.teamA.name} vs {match.teamB.name}
                    </p>
                    <p className="text-sm text-gray-500">{match.venue}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/matches/${match.id}`} className="rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                      <Edit3 size={16} />
                    </Link>
                    {match.status === 'upcoming' && (
                      <button onClick={() => startMatch(match.id)} className="rounded-lg px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                        <Play size={14} className="inline mr-1" />Start
                      </button>
                    )}
                    {match.status === 'live' && (
                      <>
                        <button onClick={() => toggleMatchStatus(match.id, match.status)} className="rounded-lg px-3 py-1.5 text-xs font-medium bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors">
                          <Pause size={14} className="inline mr-1" />Pause
                        </button>
                        <button onClick={() => endMatch(match.id)} className="rounded-lg px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                          End
                        </button>
                      </>
                    )}
                    {match.status === 'paused' && (
                      <button onClick={() => toggleMatchStatus(match.id, match.status)} className="rounded-lg px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                        <Play size={14} className="inline mr-1" />Resume
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tournaments */}
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white">My Tournaments</h2>
            <Button size="sm" onClick={() => setShowCreateTournament(true)} icon={<Plus size={14} />}>Create</Button>
          </div>
          {tourLoading ? (
            <div className="p-6"><div className="h-20 rounded-xl bg-gray-700/30 animate-pulse" /></div>
          ) : !tournaments || tournaments.length === 0 ? (
            <div className="py-12 text-center">
              <Trophy size={40} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-500">No tournaments yet</p>
              <Button className="mt-4" size="sm" onClick={() => setShowCreateTournament(true)}>Create Tournament</Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {tournaments.map(t => (
                <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                  <div>
                    <p className="text-white font-medium">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.location} · {t.teams?.length || 0} teams</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.status} />
                    <Link to={`/tournaments/${t.id}`} className="rounded-lg px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateMatchModal isOpen={showCreateMatch} onClose={() => setShowCreateMatch(false)} />
      <CreateTournamentModal isOpen={showCreateTournament} onClose={() => setShowCreateTournament(false)} />
      <CreateTeamModal isOpen={showCreateTeam} onClose={() => setShowCreateTeam(false)} />
    </div>
  );
}
