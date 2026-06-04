import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// DATE/TIME
// ============================================================

export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`;
  if (isTomorrow(d)) return `Tomorrow, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return format(d, 'dd MMM yyyy, h:mm a');
}

export function formatDateShort(date: Date): string {
  return format(date, 'dd MMM yyyy');
}

export function timeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

// ============================================================
// CRICKET MATH
// ============================================================

export function calcOvers(totalBalls: number): string {
  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  return `${overs}.${balls}`;
}

export function calcBallsFromOvers(oversString: string): number {
  const [o, b] = oversString.split('.').map(Number);
  return (o || 0) * 6 + (b || 0);
}

export function calcStrikeRate(runs: number, balls: number): number {
  if (balls === 0) return 0;
  return parseFloat(((runs / balls) * 100).toFixed(2));
}

export function calcEconomy(runs: number, balls: number): number {
  if (balls === 0) return 0;
  return parseFloat(((runs / balls) * 6).toFixed(2));
}

export function calcBattingAverage(runs: number, innings: number, notOuts: number): number {
  const dismissals = innings - notOuts;
  if (dismissals === 0) return runs;
  return parseFloat((runs / dismissals).toFixed(2));
}

export function calcBowlingAverage(runs: number, wickets: number): number {
  if (wickets === 0) return 0;
  return parseFloat((runs / wickets).toFixed(2));
}

export function calcNRR(
  runsScored: number,
  oversFaced: number,
  runsConceded: number,
  oversBowled: number
): number {
  if (oversFaced === 0 || oversBowled === 0) return 0;
  const rr1 = runsScored / oversFaced;
  const rr2 = runsConceded / oversBowled;
  return parseFloat((rr1 - rr2).toFixed(3));
}

export function calcRequiredRunRate(
  target: number,
  scored: number,
  ballsRemaining: number
): number {
  const needed = target - scored;
  if (needed <= 0) return 0;
  if (ballsRemaining <= 0) return 999;
  const oversRemaining = ballsRemaining / 6;
  return parseFloat((needed / oversRemaining).toFixed(2));
}

export function calcCurrentRunRate(runs: number, balls: number): number {
  if (balls === 0) return 0;
  const overs = balls / 6;
  return parseFloat((runs / overs).toFixed(2));
}

export function getWinProbability(
  target: number,
  scored: number,
  wickets: number,
  ballsRemaining: number
): { batting: number; bowling: number } {
  if (target <= 0 || ballsRemaining <= 0) return { batting: 50, bowling: 50 };
  const needed = target - scored;
  const rrr = calcRequiredRunRate(target, scored, ballsRemaining);
  const wicketsInHand = 10 - wickets;
  
  // Simple probability model
  let battingProb = 50;
  if (rrr < 6) battingProb = 60 + (6 - rrr) * 5;
  else if (rrr < 8) battingProb = 50;
  else if (rrr < 12) battingProb = 40 - (rrr - 8) * 5;
  else battingProb = 15;
  
  // Adjust for wickets
  battingProb = battingProb * (wicketsInHand / 10);
  battingProb = Math.max(5, Math.min(95, battingProb));
  
  return {
    batting: Math.round(battingProb),
    bowling: Math.round(100 - battingProb),
  };
}

// ============================================================
// FORMATTING
// ============================================================

export function formatRuns(runs: number, balls: number, notOut = false): string {
  return `${runs}${notOut ? '*' : ''} (${balls})`;
}

export function formatBowlingFigures(wickets: number, runs: number): string {
  return `${wickets}/${runs}`;
}

export function formatOvers(totalBalls: number, maxOvers?: number): string {
  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  if (maxOvers) return `${overs}.${balls}/${maxOvers}`;
  return `${overs}.${balls}`;
}

export function getMatchStatusColor(status: string): string {
  const colors: Record<string, string> = {
    upcoming: 'text-blue-400 bg-blue-400/10',
    toss: 'text-yellow-400 bg-yellow-400/10',
    live: 'text-green-400 bg-green-400/10 animate-pulse',
    innings_break: 'text-orange-400 bg-orange-400/10',
    completed: 'text-gray-400 bg-gray-400/10',
    abandoned: 'text-red-400 bg-red-400/10',
    archived: 'text-gray-500 bg-gray-500/10',
  };
  return colors[status] || 'text-gray-400 bg-gray-400/10';
}

export function getMatchStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    upcoming: 'Upcoming',
    toss: 'Toss',
    live: '● LIVE',
    innings_break: 'Innings Break',
    completed: 'Completed',
    abandoned: 'Abandoned',
    archived: 'Archived',
  };
  return labels[status] || status;
}

export function formatScore(runs: number, wickets: number, overs: number, balls: number): string {
  return `${runs}/${wickets} (${calcOvers(overs * 6 + balls)})`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ============================================================
// VALIDATION
// ============================================================

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[+]?[\d\s-]{10,15}$/.test(phone);
}

// ============================================================
// ARRAY/OBJECT
// ============================================================

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const group = String(item[key]);
    return { ...groups, [group]: [...(groups[group] || []), item] };
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(arr: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key], bv = b[key];
    if (av === bv) return 0;
    const cmp = av > bv ? 1 : -1;
    return direction === 'asc' ? cmp : -cmp;
  });
}

export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ============================================================
// LOCAL STORAGE
// ============================================================

export function localGet<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

export function localSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}
