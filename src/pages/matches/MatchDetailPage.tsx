import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trophy, ChevronLeft, MessageSquare, Users, BarChart3, Clock } from 'lucide-react';
import { useLiveMatch } from '../../hooks/useMatches';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components/ui/Badge';
import { Scorecard } from '../../components/cricket/Scorecard';
import { Commentary } from '../../components/cricket/Commentary';
import { LiveScoringPanel } from '../../components/cricket/LiveScoringPanel';
import { MatchStats } from '../../components/cricket/MatchStats';
import { Skeleton } from '../../components/ui/Skeleton';

const tabs = ['Scorecard', 'Commentary', 'Statistics'];

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { match, loading } = useLiveMatch(matchId || '');
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('Scorecard');
  const [showScoringPanel, setShowScoringPanel] = useState(false);

  const isHost = userProfile?.uid === match?.hostId;
  const canScore = isHost || userProfile?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-4">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Match Not Found</h2>
          <Link to="/matches" className="text-emerald-400 hover:text-emerald-300">← Back to Matches</Link>
        </div>
      </div>
    );
  }

  const currentInnings = match.currentInnings === 1 ? match.innings1 : match.innings2;
  const isLive = match.status === 'live';

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Match Hero */}
      <div className={`relative py-8 px-4 ${isLive ? 'bg-gradient-to-b from-red-950/30 to-gray-950' : 'bg-gradient-to-b from-gray-900 to-gray-950'}`}>
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/matches" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
              <ChevronLeft size={16} />
              All Matches
            </Link>
          </div>

          {/* Status & Format */}
          <div className="flex items-center gap-3 mb-6">
            <StatusBadge status={match.status} />
            <span className="text-sm text-gray-400 bg-gray-800 rounded-full px-3 py-1">{match.format} · {match.totalOvers} overs</span>
            {match.tournamentName && (
              <span className="text-sm text-yellow-400 flex items-center gap-1">
                <Trophy size={14} />
                {match.tournamentName}
              </span>
            )}
          </div>

          {/* Teams & Score */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Team A */}
            <div className="text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-gray-800 flex items-center justify-center text-3xl mb-3 overflow-hidden">
                {match.teamA.logoURL ? (
                  <img src={match.teamA.logoURL} alt={match.teamA.name} className="h-full w-full object-cover" />
                ) : '🏏'}
              </div>
              <h2 className="text-lg font-bold text-white">{match.teamA.shortName || match.teamA.name}</h2>
              {match.innings1 && (
                <div className="mt-2">
                  <p className="text-3xl font-bold text-white">{match.innings1.totalRuns}/{match.innings1.totalWickets}</p>
                  <p className="text-sm text-gray-400">({match.innings1.totalOvers.toFixed(1)} ov)</p>
                </div>
              )}
            </div>

            {/* VS / Info */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="rounded-full bg-gray-800 px-4 py-2">
                <span className="text-sm font-bold text-gray-300">VS</span>
              </div>
              {isLive && match.currentInnings === 2 && match.innings1 && match.innings2 && (
                <div className="text-center text-xs">
                  <p className="text-emerald-400 font-semibold">
                    Need {match.innings1.totalRuns + 1 - match.innings2.totalRuns}
                  </p>
                  <p className="text-gray-500">
                    from {((match.totalOvers - match.innings2.totalOvers) * 6).toFixed(0)} balls
                  </p>
                </div>
              )}
              {match.status === 'completed' && match.result && (
                <p className="text-xs text-emerald-400 text-center font-medium">{match.result}</p>
              )}
              {match.tossWinner && (
                <p className="text-xs text-gray-500 text-center">
                  Toss: {match.tossWinner} chose to {match.tossDecision}
                </p>
              )}
            </div>

            {/* Team B */}
            <div className="text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-gray-800 flex items-center justify-center text-3xl mb-3 overflow-hidden">
                {match.teamB.logoURL ? (
                  <img src={match.teamB.logoURL} alt={match.teamB.name} className="h-full w-full object-cover" />
                ) : '🏏'}
              </div>
              <h2 className="text-lg font-bold text-white">{match.teamB.shortName || match.teamB.name}</h2>
              {match.innings2 && (
                <div className="mt-2">
                  <p className="text-3xl font-bold text-white">{match.innings2.totalRuns}/{match.innings2.totalWickets}</p>
                  <p className="text-sm text-gray-400">({match.innings2.totalOvers.toFixed(1)} ov)</p>
                </div>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><MapPin size={14} />{match.venue}</span>
            {currentInnings && isLive && (
              <>
                <span className="flex items-center gap-1"><Clock size={14} />
                  CRR: {currentInnings.totalBalls > 0 ? ((currentInnings.totalRuns / currentInnings.totalBalls) * 6).toFixed(2) : '0.00'}
                </span>
                {match.currentInnings === 2 && match.innings1 && (
                  <span className="text-emerald-400">
                    RRR: {currentInnings.totalBalls < match.totalOvers * 6
                      ? ((match.innings1.totalRuns + 1 - currentInnings.totalRuns) / ((match.totalOvers * 6 - currentInnings.totalBalls) / 6)).toFixed(2)
                      : '0.00'
                    }
                  </span>
                )}
              </>
            )}
          </div>

          {/* Recent Balls */}
          {isLive && match.recentBalls && match.recentBalls.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-xs text-gray-500">This over:</span>
              {match.recentBalls.slice(-6).map((ball, i) => (
                <span key={i} className={`h-8 w-8 rounded-full text-sm font-bold flex items-center justify-center ${
                  ball === '4' ? 'bg-blue-500/30 text-blue-300' :
                  ball === '6' ? 'bg-emerald-500/30 text-emerald-300' :
                  ball === 'W' ? 'bg-red-500/30 text-red-300' :
                  ball === 'Wd' || ball === 'Nb' ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {ball}
                </span>
              ))}
            </div>
          )}

          {/* Host Controls */}
          {canScore && isLive && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowScoringPanel(!showScoringPanel)}
                className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30"
              >
                {showScoringPanel ? 'Hide Scoring Panel' : '🎯 Open Scoring Panel'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scoring Panel */}
      <AnimatePresence>
        {showScoringPanel && canScore && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-y border-gray-800 bg-gray-900/50"
          >
            <div className="mx-auto max-w-5xl p-4">
              <LiveScoringPanel match={match} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex gap-0">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'Scorecard' && <BarChart3 size={16} />}
                {tab === 'Commentary' && <MessageSquare size={16} />}
                {tab === 'Statistics' && <Users size={16} />}
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'Scorecard' && (
            <motion.div key="scorecard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Scorecard match={match} />
            </motion.div>
          )}
          {activeTab === 'Commentary' && (
            <motion.div key="commentary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Commentary match={match} />
            </motion.div>
          )}
          {activeTab === 'Statistics' && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MatchStats match={match} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
