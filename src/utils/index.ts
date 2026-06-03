/**
 * Calculate Net Run Rate (NRR) for cricket tournaments
 * NRR = (Total runs scored / Total overs faced) - (Total runs conceded / Total overs bowled)
 */
export const calcNRR = (
  runsScored: number,
  oversFaced: number,
  runsConceded: number,
  oversBowled: number
): number => {
  if (oversFaced === 0 || oversBowled === 0) return 0;
  const runRateFor = runsScored / oversFaced;
  const runRateAgainst = runsConceded / oversBowled;
  return parseFloat((runRateFor - runRateAgainst).toFixed(3));
};

export const formatScore = (home: number, away: number): string => {
  return `${home} - ${away}`;
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateStandings = (
  wins: number,
  losses: number,
  draws: number
): { points: number; gamesPlayed: number } => {
  const points = wins * 3 + draws;
  const gamesPlayed = wins + losses + draws;
  return { points, gamesPlayed };
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const classNames = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};
