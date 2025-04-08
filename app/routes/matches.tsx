import type { Route } from "./+types/matches";
import { prisma } from "~/utils/db.server";
import { MatchesCard } from "~/components/matches/matchescard";
import { matchesCache } from "~/utils/matches-cache.client";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dream5 | Matches" }];
}

export async function loader({}: Route.LoaderArgs) {
  // Get all matches with related user scores
  const matches = await prisma.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
      userScores: {
        include: {
          user: true,
        },
      },
    },
  });

  // Process each match to determine winner and score differences
  let matchesWithStats = matches.map((match) => {
    // Sort scores in descending order
    const sortedScores = [...match.userScores].sort(
      (a, b) => b.score - a.score
    );

    // Get winner and highest score
    const winner = sortedScores[0]?.user?.displayName || "No winner";
    const highestScore = sortedScores[0]?.score || 0;

    // Calculate difference with second place
    const secondHighestScore = sortedScores[1]?.score || 0;
    const secondDiff = Number((highestScore - secondHighestScore).toFixed(1));

    // Create match details string
    const details = `${match.homeTeam.name} vs ${match.awayTeam.name}`;

    return {
      id: match.id,
      number: match.matchNumber,
      details,
      winner,
      points: highestScore,
      secondDiff,
    };
  });

  // Sort matches by matchNumber (converting to numbers for comparison)
  matchesWithStats.sort((a, b) => {
    const numA = parseInt(a.number, 10) || 0;
    const numB = parseInt(b.number, 10) || 0;
    return numA - numB;
  });

  return { matches: matchesWithStats };
}

let isInitialRequest = true;

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const cacheKey = `matches-${new Date().toISOString().split("T")[0]}`;

  if (isInitialRequest) {
    isInitialRequest = false;
    const serverData = await serverLoader();
    matchesCache.set(cacheKey, serverData);
    return serverData;
  }

  const cachedData = matchesCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const serverData = await serverLoader();
  matchesCache.set(cacheKey, serverData);
  return serverData;
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Matches</h1>
      <div className="animate-pulse">
        <div className="h-24 bg-gray-200 rounded mb-4"></div>
      </div>
    </div>
  );
}

export default function Matches() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Matches</h1>
      <MatchesCard />
    </div>
  );
}
