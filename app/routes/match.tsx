import type { Route } from "./+types/match";
import { prisma } from "~/utils/db.server";
import { MatchResultCard } from "~/components/match/matchresultcard";
import { Link, useLoaderData } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { matchCache } from "~/utils/match-cache.client";

let isInitialRequest = true;

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
    const forOne = sortedScores[0].score - score.score;

    return {
      id: score.user.id,
      name: score.user.displayName,
      score: score.score,
      rank: index + 1,
      oneUp: Number(oneUp.toFixed(1)),
      forOne: Number(forOne.toFixed(1)),
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

  if (isInitialRequest) {
    isInitialRequest = false;
    const serverData = await serverLoader();
    matchCache.set(matchId, serverData);
    return serverData;
  }

  const cachedData = matchCache.get(matchId);
  if (cachedData) {
    return cachedData;
  }

  const serverData = await serverLoader();
  matchCache.set(matchId, serverData);
  return serverData;
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <div className="p-4">
      <Link
        to="/matches"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Matches
      </Link>
      <h1 className="text-2xl font-bold mb-4 text-center">Match Result</h1>
      <div className="animate-pulse">
        <div className="h-24 bg-gray-200 rounded mb-4"></div>
      </div>
    </div>
  );
}

export default function Match() {
  const { match } = useLoaderData<typeof loader>();

  const previousMatchId = Number(match.id) > 1 ? Number(match.id) - 1 : null;
  const nextMatchId = Number(match.id) < 70 ? Number(match.id) + 1 : null;

  return (
    <div className="p-4">
      <div className="flex justify-between">
        {previousMatchId && (
          <Link
            to={`/match/${previousMatchId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Previous
          </Link>
        )}
        {nextMatchId && (
          <Link
            to={`/match/${nextMatchId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>
      <h1 className="text-2xl font-bold mb-4 text-center">Match Result</h1>
      <MatchResultCard />
    </div>
  );
}
