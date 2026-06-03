
export const formatScore = (home: number, away: number): string => {
  return `${home} - ${away}`;
};

export const calculateStandings = (
  wins: number,
  losses: number,
  draws: number
): { points: number; gamesPlayed: number } => {
  const points = wins * 3 + draws;
  const gamesPlayed = wins + losses + draws;
  // Removed unused 'needed' variable
  return { points, gamesPlayed };
};
