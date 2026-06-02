import { useState } from 'react';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Match, BallEvent, DismissalType, ExtraType } from '../../types';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface ScoringProps {
  match: Match;
}

function generateCommentary(
  runs: number, isExtra: boolean, extraType: ExtraType | undefined,
  isWicket: boolean, dismissalType: DismissalType | undefined,
  batsmanName: string, bowlerName: string
): string {
  if (isWicket) {
    const msgs: Record<string, string> = {
      bowled: `BOWLED! ${bowlerName} castles ${batsmanName}! The stumps are shattered!`,
      caught: `CAUGHT! ${batsmanName} holes out! Great catch! ${bowlerName} celebrates!`,
      runout: `RUN OUT! Brilliant fielding! ${batsmanName} is short of the crease!`,
      lbw: `LBW! ${bowlerName} traps ${batsmanName} plumb in front! The finger goes up!`,
      stumped: `STUMPED! Lightning quick stumping! ${batsmanName} is out of the crease!`,
      hitwicket: `HIT WICKET! ${batsmanName} hits his own stumps! Unfortunate dismissal!`,
      retiredout: `${batsmanName} retired out.`,
    };
    return msgs[dismissalType || 'caught'] || `${batsmanName} is OUT!`;
  }
  if (isExtra) {
    const msgs: Record<string, string> = {
      wide: `Wide ball by ${bowlerName}. Extra run added.`,
      noball: `No Ball! Free hit coming up. ${bowlerName} oversteps.`,
      bye: `Bye! ${runs} run${runs > 1 ? 's' : ''} off a ${bowlerName} delivery.`,
      legbye: `Leg bye! The ball deflects off the pad for ${runs} run${runs > 1 ? 's' : ''}.`,
    };
    return msgs[extraType || 'wide'] || `Extra run(s).`;
  }
  if (runs === 0) return `Dot ball! ${bowlerName} beats ${batsmanName} outside off!`;
  if (runs === 4) return `FOUR! ${batsmanName} drives it through the covers for four!`;
  if (runs === 6) return `SIX! ${batsmanName} launches it over the boundary for a maximum!`;
  return `${runs} run${runs > 1 ? 's' : ''} taken by ${batsmanName} off ${bowlerName}.`;
}

export function LiveScoringPanel({ match }: ScoringProps) {
  const [loading, setLoading] = useState(false);
  const [wicketModal, setWicketModal] = useState(false);
  const [dismissalType, setDismissalType] = useState<DismissalType>('bowled');
  const [pendingAction, setPendingAction] = useState<{ runs: number; isExtra: boolean; extraType?: ExtraType } | null>(null);

  const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;
  if (!innings) return (
    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center text-yellow-400">
      Innings not started yet. Configure toss and players first.
    </div>
  );

  const striker = innings.batsmen.find(b => b.isStriker);
  const nonStriker = innings.batsmen.find(b => b.isNonStriker);
  const currentBowler = innings.bowlers.find(b => b.isCurrent);

  const recordBall = async (runs: number, isExtra = false, extraType?: ExtraType, isWicket = false, dismissal?: DismissalType) => {
    if (loading) return;
    setLoading(true);
    try {
      const matchRef = doc(db, 'matches', match.id);
      const inningsKey = match.currentInnings === 1 ? 'innings1' : 'innings2';
      const currentInnings = match.currentInnings === 1 ? match.innings1 : match.innings2;
      if (!currentInnings || !striker || !currentBowler) {
        toast.error('Please set striker, non-striker, and bowler first');
        return;
      }

      const totalRuns = (currentInnings.totalRuns || 0) + runs + (isExtra ? 1 : 0);
      const totalWickets = (currentInnings.totalWickets || 0) + (isWicket ? 1 : 0);
      const totalBalls = (currentInnings.totalBalls || 0) + (isExtra && (extraType === 'wide' || extraType === 'noball') ? 0 : 1);
      const completedOvers = Math.floor(totalBalls / 6);
      const ballInOver = totalBalls % 6;
      const totalOversFloat = completedOvers + ballInOver / 10;
      const isOverComplete = totalBalls > 0 && totalBalls % 6 === 0;

      const ballEvent: BallEvent = {
        id: `${Date.now()}`,
        over: Math.floor((currentInnings.totalBalls || 0) / 6),
        ball: ((currentInnings.totalBalls || 0) % 6) + 1,
        batsmanId: striker.playerId,
        batsmanName: striker.playerName,
        bowlerId: currentBowler.playerId,
        bowlerName: currentBowler.playerName,
        runs,
        isExtra,
        extraType,
        extraRuns: isExtra ? 1 : 0,
        isWicket,
        dismissalType: isWicket ? dismissal : undefined,
        dismissedPlayerId: isWicket ? striker.playerId : undefined,
        dismissedPlayerName: isWicket ? striker.playerName : undefined,
        commentary: generateCommentary(runs, isExtra, extraType, isWicket, dismissal, striker.playerName, currentBowler.playerName),
        timestamp: new Date().toISOString(),
        totalRuns,
        totalWickets,
      };

      // Update batsmen
      const updatedBatsmen = currentInnings.batsmen.map(b => {
        if (b.playerId === striker.playerId) {
          const newRuns = b.runs + runs;
          const newBalls = b.balls + (isExtra && (extraType === 'wide' || extraType === 'noball') ? 0 : 1);
          const newFours = b.fours + (runs === 4 && !isExtra ? 1 : 0);
          const newSixes = b.sixes + (runs === 6 && !isExtra ? 1 : 0);
          return {
            ...b,
            runs: newRuns,
            balls: newBalls,
            fours: newFours,
            sixes: newSixes,
            strikeRate: newBalls > 0 ? (newRuns / newBalls) * 100 : 0,
            isStriker: isWicket ? false : (runs % 2 !== 0 ? false : !isOverComplete ? true : false),
            isNonStriker: isWicket ? false : (runs % 2 !== 0 ? true : isOverComplete ? true : false),
            dismissal: isWicket ? dismissal : undefined,
          };
        }
        if (b.playerId === nonStriker?.playerId) {
          return {
            ...b,
            isStriker: isWicket ? false : (runs % 2 !== 0 ? true : isOverComplete ? true : false),
            isNonStriker: isWicket ? false : (runs % 2 !== 0 ? false : isOverComplete ? false : true),
          };
        }
        return b;
      });

      // Update bowler
      const updatedBowlers = currentInnings.bowlers.map(b => {
        if (b.playerId === currentBowler.playerId) {
          const newBalls = b.balls + (isExtra && (extraType === 'wide' || extraType === 'noball') ? 0 : 1);
          const newOvers = Math.floor(newBalls / 6) + (newBalls % 6) / 10;
          const newRuns = b.runs + runs + (isExtra ? 1 : 0);
          return {
            ...b,
            balls: newBalls,
            overs: newOvers,
            runs: newRuns,
            wickets: b.wickets + (isWicket ? 1 : 0),
            economy: newOvers > 0 ? newRuns / newOvers : 0,
            isCurrent: !isOverComplete,
          };
        }
        return { ...b, isCurrent: isOverComplete ? false : b.isCurrent };
      });

      // Recent balls indicator
      let recentBalls = [...(match.recentBalls || [])];
      if (isOverComplete) recentBalls = [];
      const ballLabel = isWicket ? 'W' : isExtra ? (extraType === 'wide' ? 'Wd' : extraType === 'noball' ? 'Nb' : extraType === 'bye' ? 'B' : 'LB') : String(runs);
      recentBalls.push(ballLabel);
      if (recentBalls.length > 6) recentBalls = recentBalls.slice(-6);

      await updateDoc(matchRef, {
        [`${inningsKey}.totalRuns`]: totalRuns,
        [`${inningsKey}.totalWickets`]: totalWickets,
        [`${inningsKey}.totalBalls`]: totalBalls,
        [`${inningsKey}.totalOvers`]: totalOversFloat,
        [`${inningsKey}.batsmen`]: updatedBatsmen,
        [`${inningsKey}.bowlers`]: updatedBowlers,
        [`${inningsKey}.ballByBall`]: arrayUnion(ballEvent),
        [`${inningsKey}.extras.total`]: (currentInnings.extras?.total || 0) + (isExtra ? 1 : 0),
        ...(extraType === 'wide' ? { [`${inningsKey}.extras.wide`]: (currentInnings.extras?.wide || 0) + 1 } : {}),
        ...(extraType === 'noball' ? { [`${inningsKey}.extras.noball`]: (currentInnings.extras?.noball || 0) + 1 } : {}),
        ...(extraType === 'bye' ? { [`${inningsKey}.extras.bye`]: (currentInnings.extras?.bye || 0) + 1 } : {}),
        ...(extraType === 'legbye' ? { [`${inningsKey}.extras.legbye`]: (currentInnings.extras?.legbye || 0) + 1 } : {}),
        recentBalls,
        updatedAt: serverTimestamp(),
      });

      toast.success(ballEvent.commentary.slice(0, 40));
    } catch (err) {
      console.error(err);
      toast.error('Failed to record ball');
    } finally {
      setLoading(false);
      setWicketModal(false);
      setPendingAction(null);
    }
  };

  const handleWicket = () => {
    setPendingAction({ runs: 0, isExtra: false });
    setWicketModal(true);
  };

  const confirmWicket = () => {
    recordBall(pendingAction?.runs || 0, pendingAction?.isExtra || false, pendingAction?.extraType, true, dismissalType);
  };

  const runButtons = [0, 1, 2, 3, 4, 5, 6];
  const extraButtons: { label: string; type: ExtraType }[] = [
    { label: 'Wide', type: 'wide' },
    { label: 'No Ball', type: 'noball' },
    { label: 'Bye', type: 'bye' },
    { label: 'Leg Bye', type: 'legbye' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white">🎯 Live Scoring Panel</h3>

      {/* Current Players */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-gray-800 p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Striker</p>
          <p className="text-sm font-bold text-emerald-400">{striker?.playerName || 'Not set'}</p>
          {striker && <p className="text-xs text-gray-400">{striker.runs}({striker.balls})</p>}
        </div>
        <div className="rounded-xl bg-gray-800 p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Non-Striker</p>
          <p className="text-sm font-bold text-blue-400">{nonStriker?.playerName || 'Not set'}</p>
          {nonStriker && <p className="text-xs text-gray-400">{nonStriker.runs}({nonStriker.balls})</p>}
        </div>
        <div className="rounded-xl bg-gray-800 p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Bowler</p>
          <p className="text-sm font-bold text-purple-400">{currentBowler?.playerName || 'Not set'}</p>
          {currentBowler && <p className="text-xs text-gray-400">{currentBowler.overs.toFixed(1)}-{currentBowler.maidens}-{currentBowler.runs}-{currentBowler.wickets}</p>}
        </div>
      </div>

      {/* Current Score */}
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
        <p className="text-3xl font-bold text-white">{innings.totalRuns}/{innings.totalWickets}</p>
        <p className="text-sm text-gray-400">({innings.totalOvers.toFixed(1)} overs)</p>
      </div>

      {/* Run Buttons */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Runs</p>
        <div className="grid grid-cols-7 gap-2">
          {runButtons.map(run => (
            <button
              key={run}
              onClick={() => recordBall(run)}
              disabled={loading}
              className={`rounded-xl py-4 text-lg font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
                run === 4 ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30' :
                run === 6 ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30' :
                run === 0 ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' :
                'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {run}
            </button>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Extras</p>
        <div className="grid grid-cols-4 gap-2">
          {extraButtons.map(extra => (
            <button
              key={extra.type}
              onClick={() => recordBall(0, true, extra.type)}
              disabled={loading}
              className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 py-3 text-sm font-semibold text-yellow-300 hover:bg-yellow-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {extra.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wicket */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dismissal</p>
        <button
          onClick={handleWicket}
          disabled={loading}
          className="w-full rounded-xl bg-red-500/10 border border-red-500/30 py-4 text-lg font-bold text-red-400 hover:bg-red-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          🎯 WICKET!
        </button>
      </div>

      {/* Wicket Modal */}
      <Modal isOpen={wicketModal} onClose={() => setWicketModal(false)} title="Wicket - Select Dismissal">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(['bowled', 'caught', 'runout', 'lbw', 'stumped', 'hitwicket', 'retiredout'] as DismissalType[]).map(d => (
              <button
                key={d}
                onClick={() => setDismissalType(d)}
                className={`rounded-xl py-3 px-4 text-sm font-semibold capitalize transition-all ${
                  dismissalType === d
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {d === 'runout' ? 'Run Out' : d === 'lbw' ? 'LBW' : d === 'hitwicket' ? 'Hit Wicket' : d === 'retiredout' ? 'Retired Out' : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          <Button variant="danger" className="w-full" onClick={confirmWicket} loading={loading}>
            Confirm Wicket - {dismissalType.toUpperCase()}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
