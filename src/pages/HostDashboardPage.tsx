import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Activity,
  Clock,
  CheckCircle,
  Trophy,
  Settings,
  Eye,
  Trash2,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getHostMatches } from '../services/matchService';
import { getHostTournaments } from '../services/tournamentService';
import { updateMatch } from '../services/matchService';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { createMatch } from '../services/matchService';
import { createTournament } from '../services/tournamentService';
import type { Match, Tournament, MatchFormat } from '../types';
import { cn, formatDateTime } from '../lib/utils';
import toast from 'react-hot-toast';

const formatOptions = ['T20', 'ODI', 'Test', 'T10', 'Custom'].map((f) => ({
  value: f,
  label: f,
}));

interface CreateMatchForm {
  title: string;
  teamAName: string;
  teamAShort: string;
  teamBName: string;
  teamBShort: string;
  venue: string;
  format: MatchFormat;
  scheduledAt: string;
  isPublic: boolean;
}

const defaultCreateMatchForm: CreateMatchForm = {
  title: '',
  teamAName: '',
  teamAShort: '',
  teamBName: '',
  teamBShort: '',
  venue: '',
  format: 'T20',
  scheduledAt: '',
  isPublic: true,
};

export const HostDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matches' | 'tournaments'>('matches');
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const [creating, setCreating] = useState(false);
  const [matchForm, setMatchForm] = useState<CreateMatchForm>(defaultCreateMatchForm);
  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    description: '',
    format: 'T20' as MatchFormat,
    location: '',
    startDate: '',
    prizePool: '',
  });

  const loadData = () => {
    if (!user) return;
    Promise.all([getHostMatches(user.uid), getHostTournaments(user.uid)])
      .then(([m, t]) => {
        setMatches(m);
        setTournaments(t);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [user]);

  const handleCreateMatch = async () => {
    if (!user) return;
    if (!matchForm.teamAName || !matchForm.teamBName || !matchForm.venue || !matchForm.scheduledAt) {
      toast.error('Please fill all required fields');
      return;
    }
    setCreating(true);
    try {
      await createMatch({
        title: matchForm.title || `${matchForm.teamAName} vs ${matchForm.teamBName}`,
        teamA: { id: `team-${Date.now()}`, name: matchForm.teamAName, shortName: matchForm.teamAShort || matchForm.teamAName.slice(0, 3).toUpperCase() },
        teamB: { id: `team-${Date.now() + 1}`, name: matchForm.teamBName, shortName: matchForm.teamBShort || matchForm.teamBName.slice(0, 3).toUpperCase() },
        venue: matchForm.venue,
        format: matchForm.format,
        status: 'upcoming',
        scheduledAt: new Date(matchForm.scheduledAt),
        hostId: user.uid,
        isPublic: matchForm.isPublic,
        currentInnings: 1,
      });
      toast.success('Match created!');
      setShowCreateMatch(false);
      setMatchForm(defaultCreateMatchForm);
      loadData();
    } catch {
      toast.error('Failed to create match');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateTournament = async () => {
    if (!user) return;
    if (!tournamentForm.name || !tournamentForm.startDate) {
      toast.error('Name and start date are required');
      return;
    }
    setCreating(true);
    try {
      await createTournament({
        name: tournamentForm.name,
        description: tournamentForm.description,
        format: tournamentForm.format,
        location: tournamentForm.location,
        startDate: new Date(tournamentForm.startDate),
        prizePool: tournamentForm.prizePool,
        hostId: user.uid,
        isActive: true,
        teams: [],
        matches: [],
        createdAt: new Date(),
      });
      toast.success('Tournament created!');
      setShowCreateTournament(false);
      setTournamentForm({ name: '', description: '', format: 'T20', location: '', startDate: '', prizePool: '' });
      loadData();
    } catch {
      toast.error('Failed to create tournament');
    } finally {
      setCreating(false);
    }
  };

  const handleStartMatch = async (matchId: string) => {
    try {
      await updateMatch(matchId, {
        status: 'live',
        startedAt: new Date(),
        innings1: { teamId: '', teamName: '', runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0, batting: [], bowling: [], isCompleted: false },
      });
      toast.success('Match started!');
      loadData();
    } catch {
      toast.error('Failed to start match');
    }
  };

  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming');
  const completedMatches = matches.filter((m) => m.status === 'completed');

  return (
    <div className="min-h-screen hero-bg pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Host Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome, {profile?.displayName ?? user?.displayName ?? 'Host'} 👋
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              icon={<Trophy size={15} />}
              onClick={() => setShowCreateTournament(true)}
            >
              New Tournament
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Plus size={15} />}
              onClick={() => setShowCreateMatch(true)}
            >
              New Match
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Live', value: liveMatches.length, icon: <Activity size={18} className="text-red-400" />, color: 'border-red-500/20' },
            { label: 'Upcoming', value: upcomingMatches.length, icon: <Clock size={18} className="text-blue-400" />, color: 'border-blue-500/20' },
            { label: 'Completed', value: completedMatches.length, icon: <CheckCircle size={18} className="text-slate-400" />, color: 'border-slate-600' },
            { label: 'Tournaments', value: tournaments.length, icon: <Trophy size={18} className="text-yellow-400" />, color: 'border-yellow-500/20' },
          ].map((s) => (
            <div key={s.label} className={cn('glass-card rounded-xl p-4 border', s.color)}>
              <div className="flex items-center justify-between mb-2">
                {s.icon}
                <span className="text-2xl font-bold text-white">{s.value}</span>
              </div>
              <p className="text-xs text-slate-500">{s.label} Matches</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl mb-5 w-fit">
          {(['matches', 'tournaments'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                'px-5 py-2 text-sm font-medium rounded-lg transition-all capitalize',
                activeTab === t ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Loading your data..." className="py-20 text-center" />
        ) : activeTab === 'matches' ? (
          <div className="space-y-3">
            {matches.length === 0 ? (
              <EmptyState
                icon="🏏"
                title="No matches yet"
                desc="Create your first match to start scoring"
                action={<Button onClick={() => setShowCreateMatch(true)} icon={<Plus size={15} />}>Create Match</Button>}
              />
            ) : (
              matches.map((m) => (
                <MatchRow
                  key={m.id}
                  match={m}
                  onStart={() => handleStartMatch(m.id)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon="🏆"
                  title="No tournaments yet"
                  desc="Create a tournament to manage multiple matches"
                  action={<Button onClick={() => setShowCreateTournament(true)} icon={<Trophy size={15} />}>Create Tournament</Button>}
                />
              </div>
            ) : (
              tournaments.map((t) => (
                <TournamentRow key={t.id} tournament={t} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Match Modal */}
      <Modal
        isOpen={showCreateMatch}
        onClose={() => setShowCreateMatch(false)}
        title="Create New Match"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Match Title (optional)"
            placeholder="e.g. Final Match"
            value={matchForm.title}
            onChange={(e) => setMatchForm({ ...matchForm, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Team A Name *"
              placeholder="Mumbai Indians"
              value={matchForm.teamAName}
              onChange={(e) => setMatchForm({ ...matchForm, teamAName: e.target.value })}
            />
            <Input
              label="Team A Short"
              placeholder="MI"
              value={matchForm.teamAShort}
              onChange={(e) => setMatchForm({ ...matchForm, teamAShort: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Team B Name *"
              placeholder="Chennai Super Kings"
              value={matchForm.teamBName}
              onChange={(e) => setMatchForm({ ...matchForm, teamBName: e.target.value })}
            />
            <Input
              label="Team B Short"
              placeholder="CSK"
              value={matchForm.teamBShort}
              onChange={(e) => setMatchForm({ ...matchForm, teamBShort: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Venue *"
              placeholder="Wankhede Stadium"
              value={matchForm.venue}
              onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
            />
            <Select
              label="Format"
              value={matchForm.format}
              onChange={(e) => setMatchForm({ ...matchForm, format: e.target.value as MatchFormat })}
              options={formatOptions}
            />
          </div>
          <Input
            label="Scheduled At *"
            type="datetime-local"
            value={matchForm.scheduledAt}
            onChange={(e) => setMatchForm({ ...matchForm, scheduledAt: e.target.value })}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={matchForm.isPublic}
              onChange={(e) => setMatchForm({ ...matchForm, isPublic: e.target.checked })}
              className="w-4 h-4 accent-green-500 rounded"
            />
            <span className="text-sm text-slate-300">Make match public</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateMatch(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" loading={creating} onClick={handleCreateMatch}>
              Create Match
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Tournament Modal */}
      <Modal
        isOpen={showCreateTournament}
        onClose={() => setShowCreateTournament(false)}
        title="Create Tournament"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Tournament Name *"
            placeholder="IPL 2025"
            value={tournamentForm.name}
            onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
          />
          <Input
            label="Description"
            placeholder="Premier cricket league..."
            value={tournamentForm.description}
            onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Format"
              value={tournamentForm.format}
              onChange={(e) => setTournamentForm({ ...tournamentForm, format: e.target.value as MatchFormat })}
              options={formatOptions}
            />
            <Input
              label="Location"
              placeholder="India"
              value={tournamentForm.location}
              onChange={(e) => setTournamentForm({ ...tournamentForm, location: e.target.value })}
            />
          </div>
          <Input
            label="Start Date *"
            type="date"
            value={tournamentForm.startDate}
            onChange={(e) => setTournamentForm({ ...tournamentForm, startDate: e.target.value })}
          />
          <Input
            label="Prize Pool (optional)"
            placeholder="₹50,00,000"
            value={tournamentForm.prizePool}
            onChange={(e) => setTournamentForm({ ...tournamentForm, prizePool: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateTournament(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" loading={creating} onClick={handleCreateTournament}>
              Create Tournament
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const MatchRow: React.FC<{ match: Match; onStart: () => void }> = ({ match, onStart }) => (
  <div className="glass-card rounded-xl p-4 flex items-center gap-4">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <p className="font-semibold text-white text-sm truncate">{match.title}</p>
        <Badge variant={match.status}>{match.status}</Badge>
      </div>
      <p className="text-xs text-slate-400">
        {match.teamA.shortName} vs {match.teamB.shortName} · {match.format} · {match.venue}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(match.scheduledAt)}</p>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {match.status === 'upcoming' && (
        <Button variant="primary" size="sm" icon={<Activity size={13} />} onClick={onStart}>
          Start
        </Button>
      )}
      {match.status === 'live' && (
        <Link to={`/match/${match.id}/score`}>
          <Button variant="outline" size="sm" icon={<Edit3 size={13} />}>
            Score
          </Button>
        </Link>
      )}
      <Link to={`/match/${match.id}`}>
        <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
          <Eye size={15} />
        </button>
      </Link>
      <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
        <Settings size={15} />
      </button>
      <button className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
        <Trash2 size={15} />
      </button>
    </div>
  </div>
);

const TournamentRow: React.FC<{ tournament: Tournament }> = ({ tournament }) => (
  <Link
    to={`/tournament/${tournament.id}`}
    className="block glass-card rounded-xl p-4 card-hover"
  >
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center text-xl shrink-0">
        🏆
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">{tournament.name}</p>
        <p className="text-xs text-slate-400">{tournament.format} · {tournament.teams.length} teams</p>
      </div>
      <Badge variant={tournament.isActive ? 'green' : 'completed'}>
        {tournament.isActive ? 'Active' : 'Ended'}
      </Badge>
    </div>
  </Link>
);

const EmptyState: React.FC<{
  icon: string;
  title: string;
  desc: string;
  action?: React.ReactNode;
}> = ({ icon, title, desc, action }) => (
  <div className="glass-card rounded-2xl p-16 text-center">
    <p className="text-5xl mb-4">{icon}</p>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm mb-6">{desc}</p>
    {action}
  </div>
);
