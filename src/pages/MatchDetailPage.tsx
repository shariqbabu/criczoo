import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronLeft, Share2, RefreshCw } from 'lucide-react';
import { subscribeToMatch, subscribeToCommentary } from '../services/matchService';
import { MatchScoreboard } from '../components/match/MatchScoreboard';
import { CommentaryList } from '../components/match/CommentaryList';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Match, Commentary } from '../types';
import { formatDateTime, formatMatchScore } from '../lib/utils';
import toast from 'react-hot-toast';

export const MatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [commentary, setCommentary] = useState<Commentary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'scorecard' | 'commentary'>('commentary');

  useEffect(() => {
    if (!id) return;
    const unsubMatch = subscribeToMatch(id, (m) => {
      setMatch(m);
      setLoading(false);
    });
    const unsubComm = subscribeToCommentary(id, setCommentary);
    return () => { unsubMatch(); unsubComm(); };
  }, [id]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: match?.title ?? 'Match', url });
    } else {
      navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-bg pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading match..." />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen hero-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🏏</p>
          <h2 className="text-xl font-bold text-white mb-2">Match not found</h2>
          <Link to="/" className="text-green-400 hover:text-green-300 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const innings1 = match.innings1;
  const innings2 = match.innings2;
  const currentInnings = match.currentInnings === 1 ? innings1 : innings2;
  const battingTeam = match.currentInnings === 1 ? match.teamA : match.teamB;

  return (
    <div className="min-h-screen hero-bg">
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-20">
        {/* Back */}
        <div className="flex items-center justify-between mb-4 pt-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Share2 size={13} />
            Share
          </button>
        </div>

        {/* Match Header */}
        <div className="glass-card rounded-2xl overflow-hidden mb-6">
          {/* Status bar */}
          <div className={`px-4 py-2 flex items-center gap-3 border-b ${
            match.status === 'live'
              ? 'bg-red-900/20 border-red-500/20'
              : match.status === 'upcoming'
              ? 'bg-blue-900/20 border-blue-500/20'
              : 'bg-slate-800/40 border-slate-700/40'
          }`}>
            <Badge variant={match.status}>{match.status.toUpperCase()}</Badge>
            <span className="text-xs text-slate-400">{match.format}</span>
            {match.tournamentName && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">{match.tournamentName}</span>
              </>
            )}
            {match.status === 'live' && (
              <RefreshCw size={12} className="ml-auto text-green-400 animate-spin" style={{ animationDuration: '3s' }} />
            )}
          </div>

          <div className="p-5">
            <h1 className="text-lg font-bold text-white mb-4">{match.title}</h1>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Team A */}
              <div className={`p-4 rounded-xl border ${
                match.currentInnings === 1 && match.status === 'live'
                  ? 'bg-green-500/8 border-green-500/20'
                  : 'bg-slate-800/40 border-slate-700/40'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {match.teamA.shortName}
                  </div>
                  <span className="text-sm font-semibold text-white truncate">
                    {match.teamA.name}
                  </span>
                </div>
                {innings1 ? (
                  <p className="text-2xl font-bold text-white score-display">
                    {innings1.runs}
                    <span className="text-slate-400 text-lg font-medium">/{innings1.wickets}</span>
                    <span className="text-slate-500 text-sm font-normal ml-2">
                      ({innings1.overs}.{innings1.balls})
                    </span>
                  </p>
                ) : (
                  <p className="text-slate-500 text-sm">Yet to bat</p>
                )}
              </div>

              {/* Team B */}
              <div className={`p-4 rounded-xl border ${
                match.currentInnings === 2 && match.status === 'live'
                  ? 'bg-green-500/8 border-green-500/20'
                  : 'bg-slate-800/40 border-slate-700/40'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {match.teamB.shortName}
                  </div>
                  <span className="text-sm font-semibold text-white truncate">
                    {match.teamB.name}
                  </span>
                </div>
                {innings2 ? (
                  <p className="text-2xl font-bold text-white score-display">
                    {innings2.runs}
                    <span className="text-slate-400 text-lg font-medium">/{innings2.wickets}</span>
                    <span className="text-slate-500 text-sm font-normal ml-2">
                      ({innings2.overs}.{innings2.balls})
                    </span>
                  </p>
                ) : (
                  <p className="text-slate-500 text-sm">Yet to bat</p>
                )}
              </div>
            </div>

            {/* Target/Result Banner */}
            {match.status === 'live' && match.currentInnings === 2 && match.targetRuns && (
              <div className="mb-4 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-300">
                  <span className="font-bold text-white">{battingTeam.name}</span> need{' '}
                  <span className="font-bold text-white">
                    {match.targetRuns - (currentInnings?.runs ?? 0)}
                  </span>{' '}
                  runs to win
                  {match.format === 'T20' && currentInnings && (
                    <> in <span className="font-bold text-white">
                      {(20 - currentInnings.overs) * 6 - currentInnings.balls}
                    </span> balls</>
                  )}
                </p>
              </div>
            )}

            {match.result && (
              <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-sm font-semibold text-green-300">🏆 {match.result}</p>
              </div>
            )}

            {/* Toss */}
            {match.tossWinner && (
              <p className="text-xs text-slate-500 mb-3">
                🪙 Toss: <span className="text-slate-400">{match.tossWinner}</span> won the toss and elected to{' '}
                <span className="text-slate-400">{match.tossDecision}</span> first
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <MapPin size={11} />
                {match.venue}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={11} />
                {formatDateTime(match.scheduledAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl mb-4">
          {(['commentary', 'scorecard'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                tab === t
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'commentary' && <CommentaryList entries={commentary} />}
        {tab === 'scorecard' && (
          innings1 || innings2 ? (
            <MatchScoreboard match={match} />
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-slate-400">Scorecard not available yet</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

// suppress unused warning
const _unused = formatMatchScore;
void _unused;
