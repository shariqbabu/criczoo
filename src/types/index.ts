export type UserRole = 'guest' | 'user' | 'host' | 'admin';
export type HostStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type MatchStatus = 'upcoming' | 'live' | 'paused' | 'completed' | 'abandoned';
export type TournamentStatus = 'upcoming' | 'live' | 'completed';
export type MatchFormat = 'T10' | 'T20' | 'ODI' | 'Test' | 'Custom';
export type DismissalType = 'bowled' | 'caught' | 'runout' | 'lbw' | 'stumped' | 'hitwicket' | 'retiredout' | 'notout';
export type ExtraType = 'wide' | 'noball' | 'bye' | 'legbye';
export type InningsStatus = 'notstarted' | 'live' | 'completed';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  mobile: string;
  photoURL?: string;
  role: UserRole;
  hostStatus?: HostStatus;
  createdAt: string;
  updatedAt: string;
  favoriteTeams?: string[];
  followingMatches?: string[];
}

export interface HostApplication {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  email: string;
  organizationName: string;
  tournamentExperience: string;
  address: string;
  idProofURL?: string;
  profilePhotoURL?: string;
  status: HostStatus;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface Player {
  id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';
  teamId: string;
  photoURL?: string;
  jerseyNumber?: number;
  battingStyle?: 'right' | 'left';
  bowlingStyle?: string;
  createdBy: string;
  stats?: PlayerStats;
}

export interface PlayerStats {
  matches: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  wickets: number;
  overs: number;
  runsConceded: number;
  highestScore: number;
  bestBowling: string;
  strikeRate: number;
  average: number;
  economy: number;
  fifties: number;
  hundreds: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoURL?: string;
  players: string[];
  createdBy: string;
  createdAt: string;
  stats?: TeamStats;
}

export interface TeamStats {
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  nrr: number;
}

export interface Tournament {
  id: string;
  name: string;
  bannerURL?: string;
  location: string;
  startDate: string;
  endDate: string;
  organizer: string;
  organizerId: string;
  rules?: string;
  status: TournamentStatus;
  format: 'league' | 'knockout' | 'group+knockout';
  teams: string[];
  matches: string[];
  createdAt: string;
  updatedAt: string;
  pointsTable?: PointsTableEntry[];
}

export interface PointsTableEntry {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  nrr: number;
  points: number;
}

export interface BatsmanInnings {
  playerId: string;
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissal?: DismissalType;
  dismissalDesc?: string;
  isStriker?: boolean;
  isNonStriker?: boolean;
  didBat: boolean;
}

export interface BowlerInnings {
  playerId: string;
  playerName: string;
  overs: number;
  balls: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  isCurrent?: boolean;
}

export interface Partnership {
  batsmanId: string;
  batsmanName: string;
  nonStrikerId: string;
  nonStrikerName: string;
  runs: number;
  balls: number;
  wicketNumber: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  runs: number;
  balls: number;
  playerId: string;
  playerName: string;
  over: string;
}

export interface Innings {
  id: string;
  inningsNumber: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
  battingTeamName: string;
  bowlingTeamName: string;
  totalRuns: number;
  totalWickets: number;
  totalBalls: number;
  totalOvers: number;
  extras: { wide: number; noball: number; bye: number; legbye: number; total: number };
  batsmen: BatsmanInnings[];
  bowlers: BowlerInnings[];
  partnerships: Partnership[];
  fallOfWickets: FallOfWicket[];
  currentStrikerId?: string;
  currentNonStrikerId?: string;
  currentBowlerId?: string;
  ballByBall: BallEvent[];
  status: InningsStatus;
  target?: number;
}

export interface BallEvent {
  id: string;
  over: number;
  ball: number;
  batsmanId: string;
  batsmanName: string;
  bowlerId: string;
  bowlerName: string;
  runs: number;
  isExtra: boolean;
  extraType?: ExtraType;
  extraRuns: number;
  isWicket: boolean;
  dismissalType?: DismissalType;
  dismissedPlayerId?: string;
  dismissedPlayerName?: string;
  commentary: string;
  timestamp: string;
  totalRuns: number;
  totalWickets: number;
}

export interface Match {
  id: string;
  teamA: { id: string; name: string; shortName: string; logoURL?: string };
  teamB: { id: string; name: string; shortName: string; logoURL?: string };
  venue: string;
  format: MatchFormat;
  customOvers?: number;
  totalOvers: number;
  tournamentId?: string;
  tournamentName?: string;
  hostId: string;
  hostName: string;
  status: MatchStatus;
  tossWinner?: string;
  tossDecision?: 'bat' | 'bowl';
  currentInnings: 1 | 2;
  innings1?: Innings;
  innings2?: Innings;
  result?: string;
  winner?: string;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  matchType: 'friendly' | 'league' | 'knockout' | 'tournament';
  recentBalls?: string[];
}

export interface Comment {
  id: string;
  matchId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match_started' | 'innings_started' | 'match_ended' | 'tournament_created' | 'host_approved' | 'host_rejected' | 'wicket' | 'milestone';
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalHosts: number;
  pendingHosts: number;
  approvedHosts: number;
  liveMatches: number;
  completedMatches: number;
  totalTournaments: number;
  totalTeams: number;
  totalPlayers: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}
