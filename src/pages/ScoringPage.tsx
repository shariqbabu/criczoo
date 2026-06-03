import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useLiveMatch, useScoringActions } from '@/hooks/useMatch';
import { matchApi } from '@/services/apiClient';
import { ArrowLeft, RotateCcw, Radio, AlertCircle } from 'lucide-react';
import type { DismissalType } from '@/types';

const runBtns = [0, 1, 2, 3, 4, 6];

export default function ScoringPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { match, loading } = useLiveMatch(matchId);
  const { recordBall, undoBall } = useScoringActions(matchId!);

  const [extraType, setExtraType] = useState<'wide' | 'no_ball' | 'bye' | 'leg_bye' | null>(null);
  const [wicketMode, setWicketMode] = useState(false);
  const [dismissalType, setDismissalType] = useState<DismissalType>('bowled');
  const [submitting, setSubmitting] = useState(false);

  const innings = match?.innings?.[match.currentInnings - 1];
  const battingTeam = innings?.battingTeam === 'teamA' ? match?.teamA : match?.teamB;
  const bowlingTeam = innings?.battingTeam === 'teamA' ? match?.teamB : match?.teamA;
  const onStrike = innings?.batting?.find(b => b.isOnStrike);
  const nonStrike = innings?.batting?.find(b => b.isCurrentBatter && !b.isOnStrike);
  const currentBowler = innings?.bowling?.find(b => b.isCurrentBowler);

  const handleRun = async (runs: number) => {
    if (!match || submitting) return;
    if (!onStrike || !nonStrike || !currentBowler) return;
    setSubmitting(true);
    try {
      await recordBall.mutateAsync({
        inningsNumber: match.currentInnings,
        over: innings?.totalOvers ?? 0,
        ball: (innings?.totalBalls ?? 0) % 6 + 1,
        bowlerId: currentBowler.playerId,
        bowlerName: currentBowler.playerName,
        batsmanOnStrikeId: onStrike.playerId,
        batsmanOnStrikeName: onStrike.playerName,
        batsmanNonStrikeId: nonStrike.playerId,
        batsmanNonStrikeName: nonStrike.playerName,
        runs: extraType ? 0 : runs,
        batsmanRuns: extraType ? 0 : runs,
        extraType: extraType || undefined,
        extraRuns: extraType ? runs : 0,
        isWicket: wicketMode,
        wicket: wicketMode ? {
          dismissalType,
          dismissedPlayerId: onStrike.playerId,
          dismissedPlayerName: onStrike.playerName,
        } : undefined,
        isFreeHit: false,
        isOverthrow: false,
      });
      setExtraType(null);
      setWicketMode(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartMatch = async () => {
    if (!match) return;
    await matchApi.start(match.id, { winner: 'teamA', decision: 'bat', timestamp: new Date() });
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div className="shimmer h-48 rounded-xl" />
          <div className="shimmer h-64 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-semibold mb-2">Match not found</h2>
          <Link to="/host/matches" className="text-primary hover:underline text-sm">Back to Matches</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/host/matches" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Matches
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500 live-pulse" />
            LIVE SCORING
          </div>
        </div>

        {/* Scoreboard */}
        <div className="bg-gradient-to-br from-green-700 to-emerald-600 text-white rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <p className="text-sm text-green-200">{battingTeam?.name}</p>
              <p className="text-3xl font-bold mt-1">
                {innings?.totalRuns ?? 0}/{innings?.totalWickets ?? 0}
              </p>
              <p className="text-green-200 text-sm">({innings?.totalOvers ?? 0}.{(innings?.totalBalls ?? 0) % 6} ov)</p>
            </div>
            <div className="text-green-200 text-sm px-4">vs</div>
            <div className="text-center flex-1">
              <p className="text-sm text-green-200">{bowlingTeam?.name}</p>
              <p className="text-xl font-bold mt-1 text-green-200">—</p>
            </div>
          </div>

          {/* Current batsmen */}
          {onStrike && nonStrike && (
            <div className="border-t border-white/20 pt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/10 rounded-lg p-2">
                <span className="text-yellow-300 text-xs">● On Strike</span>
                <p className="font-medium truncate">{onStrike.playerName}</p>
                <p className="text-green-200 text-xs">{onStrike.runs}({onStrike.balls})</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <span className="text-xs text-green-200">Non-striker</span>
                <p className="font-medium truncate">{nonStrike.playerName}</p>
                <p className="text-green-200 text-xs">{nonStrike.runs}({nonStrike.balls})</p>
              </div>
            </div>
          )}

          {currentBowler && (
            <div className="border-t border-white/20 pt-3 mt-3 text-sm">
              <span className="text-green-200 text-xs">Bowling: </span>
              <span className="font-medium">{currentBowler.playerName}</span>
              <span className="text-green-200 text-xs ml-2">{currentBowler.overs}–{currentBowler.maidens}–{currentBowler.runs}–{currentBowler.wickets}</span>
            </div>
          )}
        </div>

        {/* Match not started */}
        {match.status === 'upcoming' || match.status === 'toss' ? (
          <div className="bg-white rounded-xl border border-border p-6 text-center">
            <Radio className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">Match hasn't started yet</p>
            <button onClick={handleStartMatch}
              className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Start Match (Toss)
            </button>
          </div>
        ) : match.status === 'live' ? (
          <>
            {/* Extras selector */}
            <div className="bg-white rounded-xl border border-border p-4 mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Extras</p>
              <div className="grid grid-cols-4 gap-2">
                {(['wide', 'no_ball', 'bye', 'leg_bye'] as const).map(et => (
                  <button key={et} onClick={() => setExtraType(extraType === et ? null : et)}
                    className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                      extraType === et ? 'bg-orange-500 text-white border-orange-500' : 'border-border hover:bg-muted'
                    }`}>
                    {et.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Wicket toggle */}
            <div className="bg-white rounded-xl border border-border p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Wicket</p>
                <button onClick={() => setWicketMode(!wicketMode)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    wicketMode ? 'bg-red-500 text-white border-red-500' : 'border-border hover:bg-muted'
                  }`}>
                  {wicketMode ? '✓ Wicket' : 'Mark Wicket'}
                </button>
              </div>
              {wicketMode && (
                <select value={dismissalType} onChange={e => setDismissalType(e.target.value as DismissalType)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {['bowled','caught','lbw','run_out','stumped','hit_wicket','retired_hurt'].map(d => (
                    <option key={d} value={d}>{d.replace('_', ' ')}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Run buttons */}
            <div className="bg-white rounded-xl border border-border p-4 mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Runs</p>
              <div className="grid grid-cols-6 gap-2">
                {runBtns.map(r => (
                  <button key={r} onClick={() => handleRun(r)} disabled={submitting}
                    className={`py-4 rounded-xl text-lg font-bold border transition-all disabled:opacity-50 ${
                      r === 4 ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' :
                      r === 6 ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100' :
                      'border-border hover:bg-muted'
                    } ${wicketMode ? 'ring-2 ring-red-200' : ''}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Undo */}
            <button onClick={() => undoBall.mutate()} disabled={undoBall.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50">
              <RotateCcw className="w-4 h-4" />
              Undo Last Ball
            </button>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-border p-6 text-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Match is {match.status}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
