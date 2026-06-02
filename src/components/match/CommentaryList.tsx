import React from 'react';
import type { Commentary } from '../../types';
import { cn } from '../../lib/utils';

interface CommentaryListProps {
  entries: Commentary[];
}

const typeStyles: Record<Commentary['type'], string> = {
  normal: 'border-slate-700/40 bg-slate-800/20',
  wicket: 'border-red-500/30 bg-red-500/5',
  boundary: 'border-blue-500/30 bg-blue-500/5',
  six: 'border-purple-500/30 bg-purple-500/5',
  wide: 'border-yellow-500/30 bg-yellow-500/5',
  noball: 'border-orange-500/30 bg-orange-500/5',
  milestone: 'border-green-500/30 bg-green-500/5',
};

const typeIcon: Record<Commentary['type'], string> = {
  normal: '🏏',
  wicket: '🔴',
  boundary: '💙',
  six: '🚀',
  wide: '↔️',
  noball: '⚠️',
  milestone: '🌟',
};

const typeLabel: Record<Commentary['type'], { text: string; color: string }> = {
  normal: { text: '', color: '' },
  wicket: { text: 'WICKET!', color: 'text-red-400 font-bold' },
  boundary: { text: 'FOUR!', color: 'text-blue-400 font-bold' },
  six: { text: 'SIX!', color: 'text-purple-400 font-bold' },
  wide: { text: 'Wide', color: 'text-yellow-400 font-medium' },
  noball: { text: 'No Ball', color: 'text-orange-400 font-medium' },
  milestone: { text: 'MILESTONE', color: 'text-green-400 font-bold' },
};

export const CommentaryList: React.FC<CommentaryListProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-4xl mb-3">📻</p>
        <p className="text-slate-400">Commentary will appear here during the match</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300">Live Commentary</h3>
      </div>
      <div className="divide-y divide-slate-800/40 max-h-96 overflow-y-auto">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              'flex gap-3 p-3.5 border-l-2 transition-colors',
              typeStyles[entry.type]
            )}
          >
            <div className="shrink-0 text-base leading-none pt-0.5">
              {typeIcon[entry.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono text-slate-400 shrink-0">
                  {entry.over}.{entry.ball}
                </span>
                {typeLabel[entry.type].text && (
                  <span className={cn('text-xs', typeLabel[entry.type].color)}>
                    {typeLabel[entry.type].text}
                  </span>
                )}
                {entry.runs !== undefined && entry.runs > 0 && (
                  <span className="ml-auto text-xs font-bold text-white bg-slate-700 px-1.5 py-0.5 rounded shrink-0">
                    +{entry.runs}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{entry.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
