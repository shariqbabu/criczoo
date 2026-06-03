import { Tournament, Match } from '@/hooks/useMatch';
import { calcNRR } from '@/utils';

export interface StandingsEntry {
  teamId: string | number;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  nrr?: number;
}

const API_BASE = '/api';

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text().catch(() => 'Request failed');
    throw new Error(message || `HTTP error ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const tournamentService = {
  getAllTournaments: async (): Promise<Tournament[]> => {
    const response = await fetch(`${API_BASE}/tournaments`);
    return handleResponse<Tournament[]>(response);
  },

  getTournament: async (id: string | number): Promise<Tournament> => {
    const response = await fetch(`${API_BASE}/tournaments/${id}`);
    return handleResponse<Tournament>(response);
  },

  createTournament: async (
    payload: Partial<Tournament>
  ): Promise<Tournament> => {
    const response = await fetch(`${API_BASE}/tournaments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Tournament>(response);
  },

  updateTournament: async (
    id: string | number,
    payload: Partial<Tournament>
  ): Promise<Tournament> => {
    const response = await fetch(`${API_BASE}/tournaments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Tournament>(response);
  },

  deleteTournament: async (id: string | number): Promise<void> => {
    const response = await fetch(`${API_BASE}/tournaments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete tournament ${id}`);
    }
  },

  getStandings: async (
    tournamentId: string | number
  ): Promise<StandingsEntry[]> => {
    const response = await fetch(
      `${API_BASE}/tournaments/${tournamentId}/standings`
    );
    return handleResponse<StandingsEntry[]>(response);
  },

  /**
   * Calculate standings from matches client-side if the API doesn't support it
   */
  calculateStandingsFromMatches: (
    matches: Match[],
    teams: Array<{ id: string | number; name: string }>
  ): StandingsEntry[] => {
    const standingsMap = new Map<string | number, StandingsEntry>();

    // Initialize entries for all teams
    teams.forEach((team) => {
      standingsMap.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        won: 0,
        lost: 0,
        drawn: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        nrr: 0,
      });
    });

    // Process completed matches
    matches
      .filter((m) => m.status === 'completed')
      .forEach((match) => {
        if (
          match.homeTeamId === undefined ||
          match.awayTeamId === undefined ||
          match.homeScore === undefined ||
          match.awayScore === undefined
        ) {
          return;
        }

        const home = standingsMap.get(match.homeTeamId);
        const away = standingsMap.get(match.awayTeamId);

        if (!home || !away) return;

        home.played += 1;
        away.played += 1;
        home.goalsFor += match.homeScore;
        home.goalsAgainst += match.awayScore;
        away.goalsFor += match.awayScore;
        away.goalsAgainst += match.homeScore;

        if (match.homeScore > match.awayScore) {
          home.won += 1;
          home.points += 3;
          away.lost += 1;
        } else if (match.homeScore < match.awayScore) {
          away.won += 1;
          away.points += 3;
          home.lost += 1;
        } else {
          home.drawn += 1;
          home.points += 1;
          away.drawn += 1;
          away.points += 1;
        }

        home.goalDifference = home.goalsFor - home.goalsAgainst;
        away.goalDifference = away.goalsFor - away.goalsAgainst;

        // Calculate NRR (useful for cricket)
        home.nrr = calcNRR(
          home.goalsFor,
          home.played,
          home.goalsAgainst,
          home.played
        );
        away.nrr = calcNRR(
          away.goalsFor,
          away.played,
          away.goalsAgainst,
          away.played
        );

        standingsMap.set(match.homeTeamId, home);
        standingsMap.set(match.awayTeamId, away);
      });

    return Array.from(standingsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  },
};
