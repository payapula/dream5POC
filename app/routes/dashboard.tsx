import type { Route } from "./+types/dashboard";
import { prisma } from "~/utils/db.server";
import { AddEditMatchDetails } from "~/components/common/AddEditMatchDetails";
import { ScoreCard } from "~/components/overallscore/scorecard";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dream5 | Dashboard" }];
}

export async function loader({}: Route.LoaderArgs) {
  // Get all users
  const users = await prisma.user.findMany();

  // Get all scores
  const allScores = await prisma.userScore.findMany({
    include: {
      match: true,
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

  return { users: rankedData, totalMatches: Object.keys(scoresByMatch).length };
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
  for (const [key, value] of formData) {
    const matchId = formData.get("matchId") as string;
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
  };
}

export default function Dashboard({}: Route.ComponentProps) {
  const [clickCount, setClickCount] = useState(0);
  const showAddMatchDetails = clickCount > 5 || import.meta.env.DEV;
  return (
    <div>
      <div className="p-4">
        <div className="flex justify-between items-baseline mb-4">
          <h1
            className="text-2xl font-bold mb-4"
            onClick={() => setClickCount(clickCount + 1)}
          >
            Dashboard
          </h1>
          {showAddMatchDetails && <AddEditMatchDetails />}
        </div>
        <ScoreCard />
      </div>
    </div>
  );
}
