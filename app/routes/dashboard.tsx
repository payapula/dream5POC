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
import { OverallChart } from "~/components/charts/overall/OverallChart";
export function meta({}: Route.MetaArgs) {
  return [{ title: "Dream5 | Dashboard" }];
}

let isInitialRequest = true;

export async function loader({}: Route.LoaderArgs): Promise<DashboardLoaderData> {
  // Get all users
  const users = await prisma.user.findMany();

  // Get all scores
  const allScores = await prisma.userScore.findMany({
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
      user: true,
    },
  });

  // Group scores by match
  const scoresByMatch = allScores.reduce((acc, score) => {
    if (!acc[score.matchId]) {
      acc[score.matchId] = [];
    }
    acc[score.matchId].push(score);
    return acc;
  }, {} as Record<string, typeof allScores>);

  // Find the latest match from the scores
  let lastMatch = null;
  let lastMatchDate = new Date(0);

  // Find the most recent match
  Object.entries(scoresByMatch).forEach(([matchId, scores]) => {
    const matchDate = new Date(scores[0].match.date);
    if (matchDate > lastMatchDate) {
      lastMatchDate = matchDate;

      // Get unique match data
      const matchData = scores[0].match;

      // Calculate highest score for this match
      const highestScore = Math.max(...scores.map((s) => s.score));

      // Get users with the highest score
      const winnersIds = scores
        .filter((score) => Math.abs(score.score - highestScore) < 0.001)
        .map((score) => score.userId);

      lastMatch = {
        id: matchId,
        date: matchData.date,
        matchNumber: matchData.matchNumber,
        homeTeam: matchData.homeTeam,
        awayTeam: matchData.awayTeam,
        userScores: scores,
        winnersIds,
        highestScore,
      };
    }
  });

  // Pre-calculate highest and lowest scores for each match
  const matchStats = Object.entries(scoresByMatch).reduce(
    (acc, [matchId, scores]) => {
      acc[matchId] = {
        highestScore: Math.max(...scores.map((s) => s.score)),
        lowestScore: Math.min(...scores.map((s) => s.score)),
      };
      return acc;
    },
    {} as Record<string, { highestScore: number; lowestScore: number }>
  );

  // Calculate stats for each user
  const userStats = users.map((user) => {
    const userScores = allScores.filter((score) => score.userId === user.id);

    // Use proper decimal addition
    const totalScore = Number(
      userScores.reduce((sum, score) => sum + score.score, 0).toFixed(1)
    );

    let matchesWon = 0;
    let matchesLost = 0;

    // Now we use the pre-calculated stats with floating point comparison
    userScores.forEach((score) => {
      const stats = matchStats[score.matchId];
      /**
       * If any match is not played (or missed by entire team), the stats will be 0
       * This is a hack to avoid calculating matches not played as won or lost
       */
      if (stats.highestScore > 0 && stats.lowestScore > 0) {
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

  // Sort by total score (descending) to determine ranking
  const rankedData = userStats
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((user, index, array) => ({
      ...user,
      ranking: index + 1,
      oneUp: index > 0 ? array[index - 1].totalScore - user.totalScore : 0,
    }));

  return {
    users: rankedData,
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
  console.log("action received");
  try {
    let formData = await request.formData();
    console.log("form data processed");
    const matchId = formData.get("matchId") as string;
    console.log("match id processed");
    let upserts = [];

    for (const [key, value] of formData) {
      console.log("upsert for ", key, value);
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
      console.log("upsert for ", key, value, "completed");
    }

    console.log("all upserts completed");

    await prisma.$transaction(upserts);

    console.log("transaction completed");

    console.log("action completed");

    return {
      updateStatus: "Success",
      updatedMatchId: matchId,
    };
  } catch (error) {
    console.log("Error in dashboard action:", error);
    console.error("Error in dashboard action:", error);
    throw error; // Re-throw to let the framework handle the error
  }
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
        <OverallChart />
        <ScoreCard />
        <LastMatchStats />
      </div>
    </div>
  );
}
