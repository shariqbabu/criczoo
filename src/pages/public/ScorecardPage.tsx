import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useMatch } from '@/hooks/useMatch';
import { ArrowLeft } from 'lucide-react';

export default function ScorecardPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { match, loading } = useMatch(matchId!);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to={`/matches/${matchId}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Match
        </Link>
        <h1 className="text-2xl font-bold mb-6">Scorecard</h1>

        {loading ? (
          <div className="shimmer h-64 rounded-xl" />
        ) : match ? (
          <div className="space-y-4">
            {/* Team 1 batting */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">{match.team1Name} — Batting</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2">Batter</th>
                      <th className="text-right py-2">R</th>
                      <th className="text-right py-2">B</th>
                      <th className="text-right py-2">4s</th>
                      <th className="text-right py-2">6s</th>
                      <th className="text-right py-2">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(match.scorecard?.team1Batting || []).map((row: any, i: number) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2">
                          <div className="font-medium">{row.name}</div>
                          <div className="text-xs text-muted-foreground">{row.dismissal}</div>
                        </td>
                        <td className="text-right py-2 font-semibold">{row.runs}</td>
                        <td className="text-right py-2">{row.balls}</td>
                        <td className="text-right py-2">{row.fours}</td>
                        <td className="text-right py-2">{row.sixes}</td>
                        <td className="text-right py-2">{row.strikeRate}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold border-t-2 border-border">
                      <td className="py-2">Total</td>
                      <td colSpan={5} className="text-right py-2">
                        {match.team1Score}/{match.team1Wickets} ({match.team1Overs} ov)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Match not found.</p>
        )}
      </div>
    </Layout>
  );
}
