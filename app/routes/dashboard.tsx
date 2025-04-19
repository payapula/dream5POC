import type { Route } from "./+types/dashboard";
import type { DashboardLoaderData } from "./types/dashboard";
import { prisma } from "~/utils/db.server";
import { AddEditMatchDetails } from "~/components/common/AddEditMatchDetails";
import { ScoreCard } from "~/components/overallscore/scorecard";
import { useState } from "react";
import { matchCache } from "~/utils/match-cache.client";
import { matchesCache } from "~/utils/matches-cache.client";
import { dashboardCache } from "~/utils/dashboard-cache.client";
import { useRevalidator } from "react-router";
import { RefreshCw } from "lucide-react";
import { LastMatchStats } from "~/components/lastmatch/LastMatchStats";
import type { User, UserScore, Match, Team } from "@prisma/client";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dream5 | Dashboard" }];
}

let isInitialRequest = true;

type ScoreWithRelations = UserScore & {
  match: Match & {
    homeTeam: Team;
    awayTeam: Team;
  };
  user: User;
};

type ScoresByMatch = Record<string, ScoreWithRelations[]>;

type MatchStats = Record<string, { highestScore: number; lowestScore: number }>;

type CalculatedUserStats = {
  id: string;
  name: string;
  displayName: string;
  totalScore: number;
  matchesWon: number;
  matchesLost: number;
};

function groupScoresByMatch(allScores: ScoreWithRelations[]): ScoresByMatch {
  return allScores.reduce((acc, score) => {
    if (!acc[score.matchId]) {
      acc[score.matchId] = [];
    }
    acc[score.matchId].push(score);
    return acc;
  }, {} as ScoresByMatch);
}

function calculateMatchStats(scoresByMatch: ScoresByMatch): MatchStats {
  return Object.entries(scoresByMatch).reduce((acc, [matchId, scores]) => {
    const allMatchScores = scores.map((s) => s.score);
    acc[matchId] = {
      highestScore: Math.max(...allMatchScores),
      lowestScore: Math.min(...allMatchScores),
    };
    return acc;
  }, {} as MatchStats);
}

function findLastMatch(
  scoresByMatch: ScoresByMatch
): DashboardLoaderData["lastMatch"] {
  let lastMatch: DashboardLoaderData["lastMatch"] = null;
  let lastMatchDate = new Date(0);

  Object.entries(scoresByMatch).forEach(([matchId, scores]) => {
    // Ensure scores exist for the match before accessing index 0
    if (!scores || scores.length === 0) return;

    const currentMatch = scores[0].match;
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

function calculateAllUserStats(
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
      // Handle cases where a match might not have stats (e.g., only one player played)
      if (stats && stats.highestScore > 0) {
        if (Math.abs(score.score - stats.highestScore) < 0.001) matchesWon++;
        if (Math.abs(score.score - stats.lowestScore) < 0.001) matchesLost++;
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

function rankUsers(
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
    }

    // Add the user with calculated ranking and oneUp to the result array
    rankedUsers.push({
      ...user,
      ranking: ranking,
      oneUp: Number(oneUp.toFixed(1)), // Keep one decimal place consistent with totalScore
    });
  });

  return rankedUsers;
}

export async function loader({}: Route.LoaderArgs): Promise<DashboardLoaderData> {
  const users = await prisma.user.findMany();
  const allScores = (await prisma.userScore.findMany({
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
      user: true,
    },
  })) as ScoreWithRelations[]; // Type assertion for clarity

  if (!allScores || allScores.length === 0) {
    // Handle the case where there are no scores yet
    return {
      users: users.map((u, index) => ({
        id: u.id,
        name: u.name,
        displayName: u.displayName,
        totalScore: 0,
        matchesWon: 0,
        matchesLost: 0,
        ranking: index + 1,
        oneUp: 0,
      })),
      totalMatches: 0,
      lastMatch: null,
    };
  }

  const scoresByMatch = groupScoresByMatch(allScores);
  const matchStats = calculateMatchStats(scoresByMatch);
  const lastMatch = findLastMatch(scoresByMatch);
  const userStats = calculateAllUserStats(users, allScores, matchStats);
  const rankedUsers = rankUsers(userStats);

  return {
    users: rankedUsers,
    totalMatches: Object.keys(scoresByMatch).length,
    lastMatch,
  };
}

const userKeyMapping: Record<string, string> = {
  User1: "1",
  User2: "2",
  User3: "3",
  User4: "4",
  User5: "5",
};

export async function action({ request }: Route.ActionArgs) {
  let formData = await request.formData();
  let upserts = [];
  const matchId = formData.get("matchId") as string;

  for (const [key, value] of formData) {
    if (key in userKeyMapping && key !== "matchId") {
      const userId = userKeyMapping[key];
      upserts.push(
        prisma.userScore.upsert({
          where: {
            userId_matchId: {
              userId,
              matchId,
            },
          },
          update: {
            score: Number(value),
          },
          create: {
            userId,
            matchId,
            score: Number(value),
          },
        })
      );
    }
  }

  await prisma.$transaction(upserts);

  return {
    updateStatus: "Success",
    updatedMatchId: matchId,
  };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  if (isInitialRequest) {
    isInitialRequest = false;
    const serverData = await serverLoader();
    dashboardCache.set(serverData);
    return serverData;
  }

  // Check if we have cached data
  const cachedData = dashboardCache.get();
  if (cachedData) {
    return cachedData;
  }

  // If no cache or expired, fetch from server
  const serverData = await serverLoader();
  dashboardCache.set(serverData);
  return serverData;
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <div>
      <div className="p-4">
        <div className="flex justify-between items-baseline mb-4">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        </div>
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  const serverResponse = await serverAction();
  matchCache.invalidate(serverResponse.updatedMatchId);
  matchesCache.invalidateAll();
  dashboardCache.invalidate();
  return {
    updateStatus: "Success",
    updatedRecord: serverResponse.updatedMatchId,
  };
}

export default function Dashboard({}: Route.ComponentProps) {
  const [clickCount, setClickCount] = useState(0);
  const showAddMatchDetails = clickCount > 5 || import.meta.env.DEV;
  const revalidator = useRevalidator();

  const handleRefresh = () => {
    dashboardCache.invalidate();
    revalidator.revalidate();
  };

  return (
    <div>
      <div className="p-4">
        <div className="flex justify-between items-baseline mb-4">
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl font-bold"
              onClick={() => setClickCount(clickCount + 1)}
            >
              Dashboard
            </h1>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Refresh dashboard"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${
                  revalidator.state === "loading" ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
          {showAddMatchDetails && <AddEditMatchDetails />}
        </div>
        <ScoreCard />
        <LastMatchStats />
      </div>
    </div>
  );
}
