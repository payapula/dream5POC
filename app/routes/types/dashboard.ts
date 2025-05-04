import type { User, UserScore, Match } from "@prisma/client";

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
  totalMatchesPlayed: number;
  remainingMatches: number;
  lastMatch: LastMatch | null;
}

// Add these types:
export type ScoreWithRelations = UserScore & {
  match: Match & {
    homeTeam: Team;
    awayTeam: Team;
  };
  user: User;
};

export type ScoresByMatch = Record<string, ScoreWithRelations[]>;

export type MatchStats = Record<
  string,
  { highestScore: number; lowestScore: number }
>;

export type CalculatedUserStats = {
  id: string;
  name: string;
  displayName: string;
  totalScore: number;
  matchesWon: number;
  matchesLost: number;
};

// You might need to update DashboardLoaderData if it uses CalculatedUserStats directly
// Example modification (adjust based on your actual DashboardLoaderData):
/*
export type DashboardLoaderData = {
  users: Array<
    CalculatedUserStats & { // Combine with CalculatedUserStats
      ranking: number;
      oneUp: number;
    }
  >;
  totalMatches: number;
  lastMatch: null | (Match & {
    homeTeam: Team;
    awayTeam: Team;
    userScores: ScoreWithRelations[];
    winnersIds: string[];
    highestScore: number;
  });
};
*/
