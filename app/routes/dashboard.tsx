import type { Route } from "./+types/dashboard";
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
import type { DashboardLoaderData } from "./types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dream5 | Dashboard" }];
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

let isInitialRequest = true;

async function fetchDashboardData() {
  const serverData = await fetch("/dashboard");
  return await serverData.json();
}

export async function clientLoader(): Promise<DashboardLoaderData> {
  if (isInitialRequest) {
    isInitialRequest = false;
    const serverData = await fetchDashboardData();
    dashboardCache.set(serverData);
    return serverData;
  }

  // Check if we have cached data
  const cachedData = dashboardCache.get();
  if (cachedData) {
    return cachedData;
  }

  // If no cache or expired, fetch from server
  const serverData = await fetchDashboardData();
  dashboardCache.set(serverData);
  return serverData;
}

export function HydrateFallback() {
  return (
    <div>
      <div className="p-4">
        <div className="flex justify-between items-baseline mb-4">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        </div>
        <div className="animate-pulse">
          <div className="rounded-md border">
            <div className="border-b">
              <div className="h-6 bg-gray-200 rounded-t-md"></div>
            </div>
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-2">
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="animate-pulse mt-4">
        <div className="rounded-md border">
          <div className="border-b p-4">
            <div className="h-6 bg-gray-200 rounded-t-md w-1/3 mx-auto"></div>
          </div>
          <div className="p-4 space-y-6">
            <div className="flex flex-col items-center">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="flex items-center justify-between w-full">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const [clickCount, setClickCount] = useState(0);
  const showAddMatchDetails = clickCount > 5 || import.meta.env.DEV;
  const revalidator = useRevalidator();

  const handleRefresh = () => {
    dashboardCache.invalidate();
    revalidator.revalidate();
  };

  return (
    <div>
      {/* <HydrateFallback /> */}
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
        <ScoreCard loaderData={loaderData} />
        <LastMatchStats />
      </div>
    </div>
  );
}
