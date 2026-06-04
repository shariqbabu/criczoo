import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useLiveMatch } from '@/hooks/useMatch';
import { ArrowLeft } from 'lucide-react';
import type { Innings, BattingScorecard, BowlingScorecard } from '@/types';

export default function ScorecardPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { match, loading } = useLiveMatch(matchId);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="shimmer h-48 rounded-xl" />)}
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-semibold mb-2">Match not found</h2>
          <Link to="/" className="text-primary hover:underline text-sm">Go home</Link>
        </div>
      </Layout>
    );
  }

  const getTeamName = (side: 'teamA' | 'teamB') =>
    side === 'teamA' ? match.teamA.name : match.teamB.name;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/matches/${matchId}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Match
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-6 mb-8">
          <h1 className="text-xl font-bold">
            {match.teamA.name} vs {match.teamB.name}
          </h1>
          <p className="text-green-100 text-sm mt-1">
            {match.format} · {match.venue}{match.city ? `, ${match.city}` : ''}
          </p>
          {match.result && (
            <p className="mt-3 font-medium text-yellow-200">{match.result.description}</p>
          )}
        </div>

        {/* Innings scorecards */}
        {match.innings.map((inn: Innings, idx: number) => (
          <InningsScorecard
            key={idx}
            innings={inn}
            teamName={getTeamName(inn.battingTeam)}
            bowlingTeamName={getTeamName(inn.bowlingTeam)}
            inningsNumber={idx + 1}
          />
        ))}
      </div>
    </Layout>
  );
}

function InningsScorecard({
  innings,
  teamName,
  inningsNumber,
}: {
  innings: Innings;
  teamName: string;
  bowlingTeamName: string;
  inningsNumber: number;
}) {
  const { totalRuns, totalWickets, totalOvers, extras, batting, bowling, fallOfWickets } = innings;

  return (
    <div className="mb-10">
      {/* Innings title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{teamName} — {inningsNumber === 1 ? '1st' : '2nd'} Innings</h2>
        <span className="text-2xl font-bold">
          {totalRuns}/{totalWickets}
          <span className="text-base font-normal text-muted-foreground ml-2">({totalOvers} ov)</span>
        </span>
      </div>

      {/* Batting */}
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-4">
        <div className="bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Batting
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Batter</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">R</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">B</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">4s</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">6s</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">SR</th>
              </tr>
            </thead>
            <tbody>
              {batting.map((b: BattingScorecard) => (
                <tr key={b.playerId} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className={`font-medium ${b.isCurrentBatter ? 'text-green-700' : ''}`}>
                      {b.playerName}
                      {b.isOnStrike && <span className="ml-1 text-green-600">*</span>}
                    </p>
                    {b.dismissal && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDismissal(b.dismissal)}
                      </p>
                    )}
                    {!b.dismissal && !b.isCurrentBatter && (
                      <p className="text-xs text-muted-foreground mt-0.5">not out</p>
                    )}
                  </td>
                  <td className="text-right px-3 py-3 font-semibold">{b.runs}</td>
                  <td className="text-right px-3 py-3 text-muted-foreground">{b.balls}</td>
                  <td className="text-right px-3 py-3">{b.fours}</td>
                  <td className="text-right px-3 py-3">{b.sixes}</td>
                  <td className="text-right px-4 py-3 text-muted-foreground">
                    {b.balls > 0 ? b.strikeRate.toFixed(1) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Extras & Total */}
        <div className="px-4 py-3 border-t border-border bg-muted/20 text-sm flex flex-wrap gap-4 justify-between">
          <span className="text-muted-foreground">
            Extras: <b className="text-foreground">{extras.total}</b>
            <span className="text-xs ml-1">
              (wd {extras.wides}, nb {extras.noBalls}, b {extras.byes}, lb {extras.legByes})
            </span>
          </span>
          <span className="font-bold">Total: {totalRuns}/{totalWickets} ({totalOvers} ov)</span>
        </div>
      </div>

      {/* Bowling */}
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-4">
        <div className="bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Bowling
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Bowler</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">O</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">M</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">R</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">W</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Econ</th>
              </tr>
            </thead>
            <tbody>
              {bowling.map((b: BowlingScorecard) => (
                <tr key={b.playerId} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    {b.playerName}
                    {b.isCurrentBowler && <span className="ml-1 text-blue-600 text-xs">(bowling)</span>}
                  </td>
                  <td className="text-right px-3 py-3">{b.overs}.{b.balls % 6}</td>
                  <td className="text-right px-3 py-3 text-muted-foreground">{b.maidens}</td>
                  <td className="text-right px-3 py-3">{b.runs}</td>
                  <td className="text-right px-3 py-3 font-semibold">{b.wickets}</td>
                  <td className="text-right px-4 py-3 text-muted-foreground">{b.economy.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fall of Wickets */}
      {fallOfWickets && fallOfWickets.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Fall of Wickets
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {fallOfWickets.map((fow) => (
              <span key={fow.wicketNumber} className="bg-muted rounded px-2 py-1">
                {fow.runs}-{fow.wicketNumber} ({fow.playerName}, {fow.overs}.{fow.balls})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDismissal(d: { type: string; bowlerName?: string; fielderName?: string }): string {
  switch (d.type) {
    case 'bowled': return `b ${d.bowlerName || ''}`;
    case 'caught': return `c ${d.fielderName || ''} b ${d.bowlerName || ''}`;
    case 'lbw': return `lbw b ${d.bowlerName || ''}`;
    case 'run_out': return `run out (${d.fielderName || ''})`;
    case 'stumped': return `st ${d.fielderName || ''} b ${d.bowlerName || ''}`;
    case 'hit_wicket': return `hit wicket b ${d.bowlerName || ''}`;
    case 'retired_hurt': return 'retired hurt';
    case 'not_out': return 'not out';
    default: return d.type.replace('_', ' ');
  }
}
