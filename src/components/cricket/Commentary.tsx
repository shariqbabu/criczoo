import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import type { Match, BallEvent, Comment } from '../../types';
import { MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

function BallEventCard({ event }: { event: BallEvent }) {
  const isWicket = event.isWicket;
  const isFour = event.runs === 4 && !event.isExtra;
  const isSix = event.runs === 6 && !event.isExtra;

  return (
    <div className={`flex gap-3 p-3 rounded-xl border transition-colors ${
      isWicket ? 'bg-red-500/10 border-red-500/20' :
      isSix ? 'bg-emerald-500/10 border-emerald-500/20' :
      isFour ? 'bg-blue-500/10 border-blue-500/20' :
      'bg-gray-800/30 border-gray-700/50'
    }`}>
      <div className={`h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
        isWicket ? 'bg-red-500/30 text-red-300' :
        isSix ? 'bg-emerald-500/30 text-emerald-300' :
        isFour ? 'bg-blue-500/30 text-blue-300' :
        event.isExtra ? 'bg-yellow-500/30 text-yellow-300' :
        'bg-gray-700 text-gray-300'
      }`}>
        {isWicket ? 'W' : isSix ? '6' : isFour ? '4' : event.isExtra ? (event.extraType?.[0]?.toUpperCase() || 'E') : event.runs}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">
            {Math.floor(event.over)}.{event.ball}
          </span>
          <span className="text-xs text-gray-500">{event.batsmanName} vs {event.bowlerName}</span>
        </div>
        <p className="text-sm text-white mt-0.5">{event.commentary}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Score: {event.totalRuns}/{event.totalWickets}
        </p>
      </div>
    </div>
  );
}

export function Commentary({ match }: { match: Match }) {
  const { currentUser, userProfile } = useAuth();
  const [ballEvents, setBallEvents] = useState<BallEvent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeView, setActiveView] = useState<'ball-by-ball' | 'comments'>('ball-by-ball');

  useEffect(() => {
    const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;
    if (innings?.ballByBall) {
      setBallEvents([...innings.ballByBall].reverse());
    }
  }, [match]);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('matchId', '==', match.id),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Comment));
    });
    return unsub;
  }, [match.id]);

  const submitComment = async () => {
    if (!commentText.trim() || !currentUser || !userProfile) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        matchId: match.id,
        userId: currentUser.uid,
        userName: userProfile.name,
        userPhoto: userProfile.photoURL || '',
        text: commentText.trim(),
        createdAt: serverTimestamp(),
      });
      setCommentText('');
      toast.success('Comment added!');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex rounded-xl border border-gray-700 p-1 bg-gray-800/50 w-fit">
        <button
          onClick={() => setActiveView('ball-by-ball')}
          className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${activeView === 'ball-by-ball' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Ball by Ball
        </button>
        <button
          onClick={() => setActiveView('comments')}
          className={`flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-medium transition-all ${activeView === 'comments' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <MessageSquare size={14} />
          Fan Comments ({comments.length})
        </button>
      </div>

      {activeView === 'ball-by-ball' ? (
        <div className="space-y-2">
          {ballEvents.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">No ball-by-ball data yet</p>
            </div>
          ) : (
            ballEvents.map(event => <BallEventCard key={event.id} event={event} />)
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Comment Input */}
          {currentUser ? (
            <div className="flex gap-3 rounded-xl border border-gray-700 bg-gray-800/50 p-3">
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                {userProfile?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  onKeyDown={e => e.key === 'Enter' && submitComment()}
                  className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
                />
                <button
                  onClick={submitComment}
                  disabled={!commentText.trim() || submitting}
                  className="rounded-lg bg-emerald-500 p-1.5 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-700 py-4 text-center text-sm text-gray-500">
              <a href="/login" className="text-emerald-400 hover:text-emerald-300">Sign in</a> to comment
            </div>
          )}

          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300 overflow-hidden">
                {comment.userPhoto ? (
                  <img src={comment.userPhoto} alt="" className="h-full w-full object-cover" />
                ) : comment.userName?.[0] || 'U'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{comment.userName}</p>
                <p className="text-sm text-gray-400">{comment.text}</p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <MessageSquare size={32} className="mx-auto mb-2 text-gray-600" />
              <p>Be the first to comment!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
