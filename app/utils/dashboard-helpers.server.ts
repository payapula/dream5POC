import type { User } from "@prisma/client";
import type {
  CalculatedUserStats,
  DashboardLoaderData,
  MatchStats,
  ScoreWithRelations,
  ScoresByMatch,
} from "~/routes/types/dashboard"; // Assuming DashboardLoaderData is in this types file

export function groupScoresByMatch(
  allScores: ScoreWithRelations[]
): ScoresByMatch {
  return allScores.reduce((acc, score) => {
    if (!acc[score.matchId]) {
      acc[score.matchId] = [];
    }
    acc[score.matchId].push(score);
    return acc;
  }, {} as ScoresByMatch);
}

export function calculateMatchStats(scoresByMatch: ScoresByMatch): MatchStats {
  return Object.entries(scoresByMatch).reduce((acc, [matchId, scores]) => {
    // Ensure scores exist before mapping
    if (!scores || scores.length === 0) {
      acc[matchId] = { highestScore: 0, lowestScore: 0 }; // Default if no scores
      return acc;
    }
    const allMatchScores = scores.map((s) => s.score);
    acc[matchId] = {
      highestScore: Math.max(...allMatchScores),
      lowestScore: Math.min(...allMatchScores),
    };
    return acc;
  }, {} as MatchStats);
}

export function findLastMatch(
  scoresByMatch: ScoresByMatch
): DashboardLoaderData["lastMatch"] {
  let lastMatch: DashboardLoaderData["lastMatch"] = null;
  let lastMatchDate = new Date(0);

  Object.entries(scoresByMatch).forEach(([matchId, scores]) => {
    // Ensure scores exist for the match before accessing index 0
    if (!scores || scores.length === 0) return;

    const currentMatch = scores[0].match;
    // Add null check for currentMatch just in case
    if (!currentMatch) return;

    const matchDate = new Date(currentMatch.date);

    if (matchDate > lastMatchDate) {
      lastMatchDate = matchDate;
      const matchScores = scores.map((s) => s.score);
      const highestScore = Math.max(...matchScores);
      const winnersIds = scores
        .filter((score) => Math.abs(score.score - highestScore) < 0.001)
        .map((score) => score.userId);

      lastMatch = {
        id: matchId,
        date: currentMatch.date,
        matchNumber: currentMatch.matchNumber,
        homeTeam: currentMatch.homeTeam,
        awayTeam: currentMatch.awayTeam,
        userScores: scores,
        winnersIds,
        highestScore,
      };
    }
  });

  return lastMatch;
}

export function calculateAllUserStats(
  users: User[],
  allScores: ScoreWithRelations[],
  matchStats: MatchStats
): CalculatedUserStats[] {
  return users.map((user) => {
    const userScores = allScores.filter((score) => score.userId === user.id);

    const totalScore = Number(
      userScores.reduce((sum, score) => sum + score.score, 0).toFixed(1)
    );

    let matchesWon = 0;
    let matchesLost = 0;

    userScores.forEach((score) => {
      const stats = matchStats[score.matchId];
      // Handle cases where a match might not have stats (e.g., only one player played or data inconsistency)
      // Check if stats exist before accessing properties
      if (stats && stats.highestScore > 0) {
        // Ensure lowestScore also exists if highestScore does for valid comparison range
        if (stats.lowestScore !== undefined) {
          if (Math.abs(score.score - stats.highestScore) < 0.001) matchesWon++;
          if (Math.abs(score.score - stats.lowestScore) < 0.001) matchesLost++;
        }
      }
    });

    return {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      totalScore,
      matchesWon,
      matchesLost,
    };
  });
}

export function rankUsers(
  userStats: CalculatedUserStats[]
): DashboardLoaderData["users"] {
  // Sort by total score (descending) then by matches won (descending) as a tie-breaker
  const sortedStats = userStats.sort(
    (a, b) => b.totalScore - a.totalScore || b.matchesWon - a.matchesWon
  );

  const rankedUsers: DashboardLoaderData["users"] = []; // Initialize the result array

  sortedStats.forEach((user, index) => {
    let ranking = index + 1; // Start with default rank based on sorted position
    let oneUp = 0;
    let forOne = 0;
    // Compare with the previously processed user in the rankedUsers array
    if (index > 0) {
      const prevUserStats = sortedStats[index - 1]; // User stats from the sorted input
      const prevRankedUser = rankedUsers[index - 1]; // User data from the result array being built

      // Check for a tie based on score and matches won
      if (
        user.totalScore === prevUserStats.totalScore &&
        user.matchesWon === prevUserStats.matchesWon
      ) {
        // Assign the same rank as the previous user in case of a tie
        ranking = prevRankedUser.ranking;
      }

      // Calculate the score difference ('oneUp') only if the ranks are different
      if (ranking !== prevRankedUser.ranking) {
        // Ensure totalScore is treated as a number for subtraction
        oneUp = Number(prevUserStats.totalScore) - Number(user.totalScore);
      }

      forOne = Number(rankedUsers[0].totalScore) - Number(user.totalScore);
    }

    // Add the user with calculated ranking and oneUp to the result array
    rankedUsers.push({
      ...user,
      ranking: ranking,
      oneUp: Number(oneUp.toFixed(1)),
      forOne: Number(forOne.toFixed(1)),
    });
  });

  return rankedUsers;
}
