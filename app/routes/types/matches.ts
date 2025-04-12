// Loader data return type
export interface MatchesLoaderData {
  matches: {
    id: string;
    number: string;
    details: string;
    winner: string;
    points: string;
    secondDiff: string;
    userScores: {
      id: string;
      userId: string;
      matchId: string;
      score: number;
      user: {
        id: string;
        name: string;
        displayName: string;
      };
    }[];
  }[];
}
