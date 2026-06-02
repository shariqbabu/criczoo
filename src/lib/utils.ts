import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatOvers = (overs: number, balls: number): string => {
  return `${overs}.${balls}`;
};

export const calcStrikeRate = (runs: number, balls: number): number => {
  if (balls === 0) return 0;
  return parseFloat(((runs / balls) * 100).toFixed(1));
};

export const calcEconomy = (runs: number, overs: number, balls: number): number => {
  const totalOvers = overs + balls / 6;
  if (totalOvers === 0) return 0;
  return parseFloat((runs / totalOvers).toFixed(2));
};

export const getRequiredRunRate = (
  target: number,
  scored: number,
  oversRemaining: number
): string => {
  const needed = target - scored;
  if (oversRemaining <= 0) return '∞';
  return (needed / oversRemaining).toFixed(2);
};

export const formatMatchScore = (innings: {
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
}): string => {
  return `${innings.runs}/${innings.wickets} (${innings.overs}.${innings.balls})`;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const timeAgo = (date: Date): string => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const generateMatchTitle = (teamA: string, teamB: string): string =>
  `${teamA} vs ${teamB}`;
