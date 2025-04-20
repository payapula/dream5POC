// User score with user info
export interface UserScoreWithUser {
  id: string;
  userId: string;
  matchId: string;
  score: number;
  user: {
    id: string;
    name: string;
    displayName: string;
  };
}

// Team type
export interface Team {
  id: string;
  name: string;
}

// Last match type
export interface LastMatch {
  id: string;
  date: string | Date;
  matchNumber: string;
  homeTeam: Team;
  awayTeam: Team;
  userScores: UserScoreWithUser[];
  winnersIds: string[];
  highestScore: number;
}

// Loader data return type
export interface DashboardLoaderData {
  users: {
    id: string;
    name: string;
    displayName: string;
    totalScore: number;
    matchesWon: number;
    matchesLost: number;
    ranking: number;
    oneUp: number;
    forOne: number;
  }[];
  totalMatches: number;
  lastMatch: LastMatch | null;
}
