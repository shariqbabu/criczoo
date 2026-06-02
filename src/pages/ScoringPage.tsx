import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Send, Zap } from 'lucide-react';
import { subscribeToMatch, updateMatch, addCommentary } from '../services/matchService';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { Match, Innings } from '../types';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const RUNS = [0, 1, 2, 3, 4, 6];
const WICKET_TYPES = ['Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket'];

const emptyInnings = (teamId: string, teamName: string): Innings => ({
  teamId,
  teamName,
  runs: 0,
  wickets: 0,
  overs: 0,
  balls: 0,
  extras: 0,
  batting: [],
  bowling: [],
  isCompleted: false,
});

export const ScoringPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [commentary, setCommentary] = useState('');
  const [wicketType, setWicketType] = useState('Bowled');
  const [batsmanOut, setBatsmanOut] = useState('');

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToMatch(id, (m) => {
      setMatch(m);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen hero-bg pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading scoring panel..." />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen hero-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Match not found</p>
          <Link to="/host" className="text-green-400 text-sm">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (match.hostId !== user?.uid) {
    return (
      <div className="min-h-screen hero-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-2">You don't have permission to score this match</p>
          <Link to="/" className="text-green-400 text-sm">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const currentInnings = match.currentInnings === 1 ? match.innings1 : match.innings2;
  const battingTeam = match.currentInnings === 1 ? match.teamA : match.teamB;

  const inningsKey = match.currentInnings === 1 ? 'innings1' : 'innings2';

  const handleAddRuns = async (runs: number) => {
    if (!match || !currentInnings) return;
    setUpdating(true);
    try {
      const newBalls = currentInnings.balls + 1;
      const newOvers = newBalls === 6 ? currentInnings.overs + 1 : currentInnings.overs;
      const finalBalls = newBalls === 6 ? 0 : newBalls;

      const updatedInnings: Innings = {
        ...currentInnings,
        runs: currentInnings.runs + runs,
        overs: newOvers,
        balls: finalBalls,
      };

      const commType = runs === 4 ? 'boundary' : runs === 6 ? 'six' : 'normal';
      const commText = commentary || (
        runs === 0 ? 'Dot ball.' :
        runs === 4 ? 'FOUR! Beautifully timed.' :
        runs === 6 ? 'SIX! Over the ropes!' :
        `${runs} run${runs > 1 ? 's' : ''} taken.`
      );

      await Promise.all([
        updateMatch(match.id, { [inningsKey]: updatedInnings }),
        addCommentary(match.id, {
          over: currentInnings.overs,
          ball: currentInnings.balls + 1,
          text: commText,
          type: commType,
          runs,
          timestamp: new Date(),
        }),
      ]);
      setCommentary('');
    } catch {
      toast.error('Failed to update score');
    } finally {
      setUpdating(false);
    }
  };

  const handleWide = async () => {
    if (!currentInnings) return;
    setUpdating(true);
    try {
      const updatedInnings: Innings = {
        ...currentInnings,
        runs: currentInnings.runs + 1,
        extras: currentInnings.extras + 1,
      };
      await Promise.all([
        updateMatch(match.id, { [inningsKey]: updatedInnings }),
        addCommentary(match.id, {
          over: currentInnings.overs,
          ball: currentInnings.balls,
          text: commentary || 'Wide ball called by the umpire.',
          type: 'wide',
          runs: 1,
          timestamp: new Date(),
        }),
      ]);
      setCommentary('');
    } catch {
      toast.error('Failed to add wide');
    } finally {
      setUpdating(false);
    }
  };

  const handleWicket = async () => {
    if (!currentInnings) return;
    setUpdating(true);
    try {
      const newBalls = currentInnings.balls + 1;
      const newOvers = newBalls === 6 ? currentInnings.overs + 1 : currentInnings.overs;
      const finalBalls = newBalls === 6 ? 0 : newBalls;
      const updatedInnings: Innings = {
        ...currentInnings,
        wickets: currentInnings.wickets + 1,
        overs: newOvers,
        balls: finalBalls,
      };
      await Promise.all([
        updateMatch(match.id, { [inningsKey]: updatedInnings }),
        addCommentary(match.id, {
          over: currentInnings.overs,
          ball: currentInnings.balls + 1,
          text: commentary || `WICKET! ${batsmanOut || 'Batsman'} is out ${wicketType}!`,
          type: 'wicket',
          runs: 0,
          timestamp: new Date(),
        }),
      ]);
      setCommentary('');
      setBatsmanOut('');
    } catch {
      toast.error('Failed to add wicket');
    } finally {
      setUpdating(false);
    }
  };

  const handleEndInnings = async () => {
    try {
      if (match.currentInnings === 1) {
        const innings1Updated: Innings = currentInnings
          ? { ...currentInnings, isCompleted: true }
          : emptyInnings(match.teamA.id, match.teamA.name);
        await updateMatch(match.id, {
          currentInnings: 2,
          targetRuns: (currentInnings?.runs ?? 0) + 1,
          innings1: innings1Updated,
          innings2: emptyInnings(match.teamB.id, match.teamB.name),
        });
        toast.success('Innings ended! Now innings 2');
      } else {
        const innings2Updated: Innings = currentInnings
          ? { ...currentInnings, isCompleted: true }
          : emptyInnings(match.teamB.id, match.teamB.name);
        await updateMatch(match.id, {
          status: 'completed',
          completedAt: new Date(),
          innings2: innings2Updated,
        });
        toast.success('Match completed!');
      }
    } catch {
      toast.error('Failed to end innings');
    }
  };

  return (
    <div className="min-h-screen hero-bg pt-16">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pt-2">
          <Link to="/host" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm">
            <ChevronLeft size={16} />
            Dashboard
          </Link>
          <Badge variant="live">SCORING MODE</Badge>
        </div>

        {/* Score Display */}
        <div className="glass-card rounded-2xl p-5 mb-5 text-center">
          <p className="text-sm text-slate-400 mb-1">
            {battingTeam.name} — Innings {match.currentInnings}
          </p>
          <p className="text-5xl font-bold text-white score-display">
            {currentInnings?.runs ?? 0}
            <span className="text-3xl text-slate-400">/{currentInnings?.wickets ?? 0}</span>
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {currentInnings?.overs ?? 0}.{currentInnings?.balls ?? 0} overs
          </p>
          {match.targetRuns && match.currentInnings === 2 && (
            <div className="mt-3 text-sm text-blue-300">
              Target: {match.targetRuns} | Need: {match.targetRuns - (currentInnings?.runs ?? 0)} more
            </div>
          )}
        </div>

        {/* Commentary Input */}
        <div className="glass-card rounded-xl p-4 mb-4">
          <Input
            placeholder="Add commentary (optional)..."
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
          />
        </div>

        {/* Run Buttons */}
        <div className="glass-card rounded-2xl p-5 mb-4">
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Add Runs</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {RUNS.map((r) => (
              <button
                key={r}
                onClick={() => handleAddRuns(r)}
                disabled={updating}
                className={cn(
                  'py-4 rounded-xl text-xl font-bold transition-all disabled:opacity-50 active:scale-95',
                  r === 4
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30'
                    : r === 6
                    ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30'
                    : r === 0
                    ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
                    : 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Extras</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={handleWide} disabled={updating} icon={<span>↔️</span>}>
              Wide (+1)
            </Button>
            <Button variant="secondary" onClick={() => handleAddRuns(1)} disabled={updating} icon={<span>⚠️</span>}>
              No Ball (+1)
            </Button>
          </div>
        </div>

        {/* Wicket */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Wicket</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input
              placeholder="Batsman out (name)"
              value={batsmanOut}
              onChange={(e) => setBatsmanOut(e.target.value)}
            />
            <Select
              value={wicketType}
              onChange={(e) => setWicketType(e.target.value)}
              options={WICKET_TYPES.map((w) => ({ value: w, label: w }))}
            />
          </div>
          <Button variant="danger" className="w-full" onClick={handleWicket} disabled={updating} icon={<Zap size={15} />}>
            Record Wicket
          </Button>
        </div>

        {/* Add Commentary Only */}
        <div className="glass-card rounded-xl p-4 mb-4">
          <Button
            variant="ghost"
            className="w-full text-slate-400"
            onClick={() => {
              if (!commentary.trim() || !currentInnings) return;
              addCommentary(match.id, {
                over: currentInnings.overs,
                ball: currentInnings.balls,
                text: commentary,
                type: 'normal',
                timestamp: new Date(),
              }).then(() => setCommentary(''));
            }}
            icon={<Send size={15} />}
          >
            Add Commentary Only
          </Button>
        </div>

        {/* End Innings */}
        <div className="glass-card rounded-xl p-4">
          <Button variant="secondary" className="w-full" onClick={handleEndInnings} disabled={updating}>
            {match.currentInnings === 1 ? '→ End Innings & Start 2nd' : '🏁 End Match'}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <Link to={`/match/${match.id}`} className="text-xs text-slate-500 hover:text-green-400 transition-colors">
            View live scorecard →
          </Link>
        </div>
      </div>
    </div>
  );
};
