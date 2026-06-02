export type UserRole = 'admin' | 'host' | 'viewer';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface Player {
  id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  teamId: string;
  photoUrl?: string;
  jerseyNumber?: number;
}

export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';
export type MatchFormat = 'T20' | 'ODI' | 'Test' | 'T10' | 'Custom';

export interface BattingEntry {
  playerId: string;
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissal?: string;
  strikeRate: number;
}

export interface BowlingEntry {
  playerId: string;
  playerName: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  noBalls: number;
  wides: number;
}

export interface Innings {
  teamId: string;
  teamName: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: number;
  batting: BattingEntry[];
  bowling: BowlingEntry[];
  isCompleted: boolean;
}

export interface Commentary {
  id: string;
  over: number;
  ball: number;
  text: string;
  type: 'normal' | 'wicket' | 'boundary' | 'six' | 'wide' | 'noball' | 'milestone';
  runs?: number;
  timestamp: Date;
  isAuto?: boolean;
}

export interface Match {
  id: string;
  title: string;
  tournamentId?: string;
  tournamentName?: string;
  teamA: Team;
  teamB: Team;
  venue: string;
  format: MatchFormat;
  status: MatchStatus;
  tossWinner?: string;
  tossDecision?: 'bat' | 'bowl';
  currentInnings: 1 | 2;
  innings1?: Innings;
  innings2?: Innings;
  currentBatsmen?: { striker: string; nonStriker: string };
  currentBowler?: string;
  result?: string;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  hostId: string;
  isPublic: boolean;
  commentary?: Commentary[];
  targetRuns?: number;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: MatchFormat;
  startDate: Date;
  endDate?: Date;
  teams: Team[];
  matches: string[];
  hostId: string;
  isActive: boolean;
  logoUrl?: string;
  prizePool?: string;
  location?: string;
  createdAt: Date;
}

export interface MatchSummary {
  matchId: string;
  teamA: string;
  teamAScore: string;
  teamB: string;
  teamBScore: string;
  result: string;
  status: MatchStatus;
  format: MatchFormat;
  scheduledAt: Date;
  venue: string;
}
