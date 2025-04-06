import type { Route } from "./+types/match";
import { prisma } from "~/utils/db.server";
import { MatchResultCard } from "~/components/match/matchresultcard";

let isInitialRequest = true;
let cache = new Map();

export async function loader({ params }: Route.LoaderArgs) {
  const { matchId } = params;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
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

  if (!match) {
    throw new Response("Match not found", { status: 404 });
  }

  // Sort user scores by score in descending order
  const sortedScores = [...match.userScores].sort((a, b) => b.score - a.score);

  // Process data to include ranking and 1Up values
  const userResults = sortedScores.map((score, index) => {
    // Calculate the 1Up (points needed to reach the rank above)
    const oneUp = index > 0 ? sortedScores[index - 1].score - score.score : 0;

    return {
      id: score.user.id,
      name: score.user.displayName,
      score: score.score,
      rank: index + 1,
      oneUp: Number(oneUp.toFixed(1)),
    };
  });

  const matchDetails = {
    id: match.id,
    number: match.matchNumber,
    date: match.date,
    details: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    winner: sortedScores[0]?.user.displayName || "No winner",
  };

  return { match: matchDetails, results: userResults };
}

export async function clientLoader({
  serverLoader,
  params,
}: Route.ClientLoaderArgs) {
  const matchId = params.matchId;
  const cacheKey = `match-${matchId}`;

  if (isInitialRequest) {
    isInitialRequest = false;
    const serverData = await serverLoader();
    cache.set(cacheKey, serverData);
    return serverData;
  }

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const serverData = await serverLoader();
  cache.set(cacheKey, serverData);
  return serverData;
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Match Result</h1>
      <div className="animate-pulse">
        <div className="h-24 bg-gray-200 rounded mb-4"></div>
      </div>
    </div>
  );
}

export default function Match() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Match Result</h1>
      <MatchResultCard />
    </div>
  );
}
