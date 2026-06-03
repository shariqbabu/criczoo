// ============================================================
// CORE TYPES
// ============================================================

export type UserRole = 'user' | 'host' | 'admin';
export type MatchStatus = 'upcoming' | 'toss' | 'live' | 'innings_break' | 'completed' | 'archived' | 'abandoned';
export type MatchFormat = 'T10' | 'T20' | 'ODI' | 'Test' | 'Custom';
export type BattingStyle = 'Right Handed' | 'Left Handed';
export type BowlingStyle = 'Right Arm Fast' | 'Right Arm Medium' | 'Right Arm Off Spin' | 'Right Arm Leg Spin' | 'Left Arm Fast' | 'Left Arm Medium' | 'Left Arm Orthodox' | 'Left Arm Chinaman';
export type PlayerRole = 'Batsman' | 'Bowler' | 'All Rounder' | 'Wicket Keeper';
export type DismissalType = 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket' | 'handled_ball' | 'obstructing' | 'timed_out' | 'retired_hurt' | 'retired_out' | 'not_out';
export type TournamentFormat = 'league' | 'knockout' | 'round_robin' | 'group_stage' | 'custom';
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';
export type BallType = 'normal' | 'wide' | 'no_ball' | 'bye' | 'leg_bye';
export type HostApplicationStatus = 'pending' | 'approved' | 'rejected';

// ============================================================
// USER
// ============================================================

export interface UserProfile {
  uid: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  city?: string;
  state?: string;
  bio?: string;
  role: UserRole;
  emailVerified: boolean;
  stats: UserStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  matchesPlayed: number;
  totalRuns: number;
  totalWickets: number;
  highestScore: number;
  bestBowling: string;
}

export interface HostApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  organizationName: string;
  description: string;
  phone: string;
  city: string;
  state: string;
  status: HostApplicationStatus;
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// TEAM
// ============================================================

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  banner?: string;
  description?: string;
  city?: string;
  foundedYear?: number;
  captainId?: string;
  captainName?: string;
  ownerId: string;
  ownerName: string;
  playerIds: string[];
  stats: TeamStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamStats {
  matchesPlayed: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  winPercentage: number;
  totalRuns: number;
  highestScore: number;
  lowestScore: number;
}

// ============================================================
// PLAYER
// ============================================================

export interface Player {
  id: string;
  name: string;
  photo?: string;
  dateOfBirth?: string;
  battingStyle: BattingStyle;
  bowlingStyle?: BowlingStyle;
  role: PlayerRole;
  jerseyNumber?: number;
  teamId?: string;
  teamName?: string;
  ownerId: string;
  careerStats: PlayerCareerStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerCareerStats {
  batting: BattingCareerStats;
  bowling: BowlingCareerStats;
  fielding: FieldingStats;
}

export interface BattingCareerStats {
  matches: number;
  innings: number;
  notOuts: number;
  runs: number;
  balls: number;
  highestScore: number;
  highestScoreNotOut: boolean;
  average: number;
  strikeRate: number;
  centuries: number;
  halfCenturies: number;
  fours: number;
  sixes: number;
  ducks: number;
}

export interface BowlingCareerStats {
  matches: number;
  innings: number;
  overs: number;
  balls: number;
  maidens: number;
  runs: number;
  wickets: number;
  bestFiguresWickets: number;
  bestFiguresRuns: number;
  average: number;
  economy: number;
  strikeRate: number;
  fourWickets: number;
  fiveWickets: number;
  dotBalls: number;
}

export interface FieldingStats {
  catches: number;
  runOuts: number;
  stumpings: number;
}

// ============================================================
// MATCH
// ============================================================

export interface Match {
  id: string;
  title?: string;
  teamA: MatchTeam;
  teamB: MatchTeam;
  venue: string;
  city?: string;
  format: MatchFormat;
  totalOvers: number;
  status: MatchStatus;
  toss?: TossResult;
  currentInnings: number; // 1 or 2
  innings: Innings[];
  result?: MatchResult;
  isPublic: boolean;
  tournamentId?: string;
  tournamentName?: string;
  hostId: string;
  hostName: string;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  playerOfMatch?: string;
  playerOfMatchName?: string;
  drsEnabled: boolean;
  superOver: boolean;
  umpires?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchTeam {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  squad: SquadPlayer[];
  playingXI: string[];
  captain?: string;
  viceCaptain?: string;
  wicketKeeper?: string;
  impactPlayer?: string;
  substitutes?: string[];
}

export interface SquadPlayer {
  playerId: string;
  playerName: string;
  role: PlayerRole;
  battingStyle?: BattingStyle;
  bowlingStyle?: BowlingStyle;
  jerseyNumber?: number;
  photo?: string;
}

export interface TossResult {
  winner: 'teamA' | 'teamB';
  decision: 'bat' | 'field';
  timestamp: Date;
}

export interface Innings {
  number: number;
  battingTeam: 'teamA' | 'teamB';
  bowlingTeam: 'teamA' | 'teamB';
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  totalBalls: number;
  extras: Extras;
  batting: BattingScorecard[];
  bowling: BowlingScorecard[];
  fallOfWickets: FallOfWicket[];
  partnerships: Partnership[];
  powerplays: Powerplay[];
  isCompleted: boolean;
  allOut: boolean;
  declared: boolean;
  targetRuns?: number;
  requiredRuns?: number;
  requiredBalls?: number;
}

export interface BattingScorecard {
  playerId: string;
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissal?: Dismissal;
  battingPosition: number;
  isCurrentBatter: boolean;
  isOnStrike: boolean;
}

export interface Dismissal {
  type: DismissalType;
  bowlerId?: string;
  bowlerName?: string;
  fielderId?: string;
  fielderName?: string;
  ball: number;
  over: number;
}

export interface BowlingScorecard {
  playerId: string;
  playerName: string;
  overs: number;
  balls: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  dotBalls: number;
  wides: number;
  noBalls: number;
  isCurrentBowler: boolean;
}

export interface Extras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  penalties: number;
  total: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  playerId: string;
  playerName: string;
  runs: number;
  overs: number;
  balls: number;
}

export interface Partnership {
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  runs: number;
  balls: number;
  wicketNumber: number;
}

export interface Powerplay {
  type: 'mandatory' | 'batting' | 'bowling';
  startOver: number;
  endOver: number;
  runs: number;
  wickets: number;
}

export interface MatchResult {
  winner: 'teamA' | 'teamB' | 'tie' | 'no_result' | 'abandoned';
  winnerName?: string;
  margin?: number;
  marginType?: 'runs' | 'wickets';
  method?: 'DLS' | 'normal' | 'super_over';
  description: string;
  nrrImpact?: { teamA: number; teamB: number };
}

// ============================================================
// BALL
// ============================================================

export interface Ball {
  id: string;
  matchId: string;
  inningsNumber: number;
  over: number;
  ball: number;
  bowlerId: string;
  bowlerName: string;
  batsmanOnStrikeId: string;
  batsmanOnStrikeName: string;
  batsmanNonStrikeId: string;
  batsmanNonStrikeName: string;
  runs: number;
  batsmanRuns: number;
  extraType?: 'wide' | 'no_ball' | 'bye' | 'leg_bye';
  extraRuns: number;
  isWicket: boolean;
  wicket?: WicketInfo;
  isFreeHit: boolean;
  isOverthrow: boolean;
  overthrowRuns?: number;
  commentary?: string;
  drsReview?: DRSReview;
  createdAt: Date;
}

export interface WicketInfo {
  dismissalType: DismissalType;
  dismissedPlayerId: string;
  dismissedPlayerName: string;
  fielderId?: string;
  fielderName?: string;
}

export interface DRSReview {
  team: 'batting' | 'bowling';
  decision: 'upheld' | 'overturned' | 'pending';
  originalDecision: string;
}

// ============================================================
// TOURNAMENT
// ============================================================

export interface Tournament {
  id: string;
  name: string;
  logo?: string;
  banner?: string;
  description?: string;
  format: TournamentFormat;
  status: TournamentStatus;
  hostId: string;
  hostName: string;
  startDate: Date;
  endDate?: Date;
  venue?: string;
  city?: string;
  teams: TournamentTeam[];
  matchFormat: MatchFormat;
  totalOvers: number;
  totalGroups?: number;
  teamsPerGroup?: number;
  qualifiersCount?: number;
  prizePool?: string;
  sponsors?: string[];
  isPublic: boolean;
  registrationOpen: boolean;
  maxTeams: number;
  entryFee?: number;
  rules?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentTeam {
  teamId: string;
  teamName: string;
  teamLogo?: string;
  groupName?: string;
  qualified?: boolean;
  eliminated?: boolean;
  registeredAt: Date;
}

export interface PointsTable {
  id: string;
  tournamentId: string;
  groupName?: string;
  entries: PointsTableEntry[];
  updatedAt: Date;
}

export interface PointsTableEntry {
  teamId: string;
  teamName: string;
  teamLogo?: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  runsScored: number;
  runsConceded: number;
  oversFaced: number;
  oversBowled: number;
  nrr: number;
  qualified?: boolean;
}

// ============================================================
// COMMENTARY
// ============================================================

export interface Commentary {
  id: string;
  matchId: string;
  inningsNumber: number;
  over: number;
  ball: number;
  text: string;
  type: 'ball' | 'wicket' | 'boundary' | 'six' | 'milestone' | 'over' | 'innings' | 'match';
  timestamp: Date;
}

// ============================================================
// NOTIFICATION
// ============================================================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'match_started' | 'match_completed' | 'wicket' | 'milestone' | 'tournament' | 'system';
  matchId?: string;
  tournamentId?: string;
  isRead: boolean;
  createdAt: Date;
}

// ============================================================
// LEADERBOARD
// ============================================================

export interface Leaderboard {
  id: string;
  type: 'batting' | 'bowling' | 'allrounder';
  period: 'all_time' | 'season' | 'tournament';
  tournamentId?: string;
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  playerPhoto?: string;
  teamName?: string;
  value: number;
  label: string;
  matches: number;
}

// ============================================================
// STATS
// ============================================================

export interface MatchStats {
  topScorer: { name: string; runs: number; balls: number };
  topWicketTaker: { name: string; wickets: number; runs: number; overs: number };
  mostSixes: { name: string; count: number };
  mostFours: { name: string; count: number };
  highestPartnership: Partnership & { description: string };
  winProbability?: { teamA: number; teamB: number };
}

// ============================================================
// FORMS
// ============================================================

export interface CreateMatchForm {
  teamAId: string;
  teamBId: string;
  venue: string;
  city: string;
  format: MatchFormat;
  totalOvers: number;
  scheduledAt: string;
  isPublic: boolean;
  tournamentId?: string;
  drsEnabled: boolean;
}

export interface CreateTeamForm {
  name: string;
  shortName: string;
  description?: string;
  city?: string;
  foundedYear?: number;
}

export interface CreatePlayerForm {
  name: string;
  dateOfBirth?: string;
  battingStyle: BattingStyle;
  bowlingStyle?: BowlingStyle;
  role: PlayerRole;
  jerseyNumber?: number;
  teamId?: string;
}

export interface CreateTournamentForm {
  name: string;
  description?: string;
  format: TournamentFormat;
  matchFormat: MatchFormat;
  totalOvers: number;
  startDate: string;
  endDate?: string;
  venue?: string;
  city?: string;
  maxTeams: number;
  isPublic: boolean;
  registrationOpen: boolean;
  prizePool?: string;
  entryFee?: number;
  rules?: string;
  totalGroups?: number;
  teamsPerGroup?: number;
  qualifiersCount?: number;
}

export interface ScoringAction {
  type: 'run' | 'wide' | 'no_ball' | 'bye' | 'leg_bye' | 'wicket' | 'four' | 'six';
  runs?: number;
  extraRuns?: number;
  wicketType?: DismissalType;
  dismissedPlayerId?: string;
  fielderId?: string;
  isOverthrow?: boolean;
  overthrowRuns?: number;
  isFreeHit?: boolean;
}

// ============================================================
// API RESPONSES
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  lastDoc?: string;
}

// ============================================================
// SETTINGS
// ============================================================

export interface AppSettings {
  id: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  allowHostApplications: boolean;
  featuredMatchIds: string[];
  announcementText?: string;
  announcementActive: boolean;
  updatedAt: Date;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
  tournamentId?: string;
  isActive: boolean;
  createdAt: Date;
}
