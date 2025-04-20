import type {
  DashboardLoaderData,
  ScoreWithRelations,
} from "../types/dashboard";
import { prisma } from "~/utils/db.server";
import {
  calculateAllUserStats,
  calculateMatchStats,
  findLastMatch,
  groupScoresByMatch,
  rankUsers,
} from "~/utils/dashboard-helpers.server";

export async function loader({}): Promise<DashboardLoaderData> {
  const start = performance.now();
  const [users, allScores] = await Promise.all([
    prisma.user.findMany(),
    prisma.userScore.findMany({
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        user: true,
      },
    }) as Promise<ScoreWithRelations[]>,
  ]);
  // Your code here
  const end = performance.now();
  console.log(`Execution time of prisma query: ${end - start} milliseconds`);

  if (!allScores || allScores.length === 0) {
    // Handle the case where there are no scores yet
    return {
      // Make sure this structure matches DashboardLoaderData['users'] type
      users: users.map((u, index) => ({
        id: u.id,
        name: u.name,
        displayName: u.displayName,
        totalScore: 0,
        matchesWon: 0,
        matchesLost: 0,
        ranking: index + 1,
        oneUp: 0,
        forOne: 0,
      })),
      totalMatches: 0,
      lastMatch: null,
    };
  }

  const start2 = performance.now();
  // Use imported functions
  const scoresByMatch = groupScoresByMatch(allScores);
  const matchStats = calculateMatchStats(scoresByMatch);
  const lastMatch = findLastMatch(scoresByMatch);
  const userStats = calculateAllUserStats(users, allScores, matchStats);
  const rankedUsers = rankUsers(userStats);
  const end2 = performance.now();
  console.log(
    `Execution time of dashboard helpers: ${end2 - start2} milliseconds`
  );

  return {
    users: rankedUsers,
    totalMatches: Object.keys(scoresByMatch).length,
    lastMatch,
  };
}
