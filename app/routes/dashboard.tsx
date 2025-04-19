import type { Route } from "./+types/dashboard";
import type {
  DashboardLoaderData,
  ScoreWithRelations,
} from "./types/dashboard";
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
import {
  calculateAllUserStats,
  calculateMatchStats,
  findLastMatch,
  groupScoresByMatch,
  rankUsers,
} from "~/utils/dashboard-helpers.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dream5 | Dashboard" }];
}

let isInitialRequest = true;

export async function loader({}: Route.LoaderArgs): Promise<DashboardLoaderData> {
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
