import type { Route } from "./+types/dashboard";
import { prisma } from "~/utils/db.server";

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

  // Calculate stats for each user
  const userStats = users.map((user) => {
    const userScores = allScores.filter((score) => score.userId === user.id);
    const totalScore = userScores.reduce((sum, score) => sum + score.score, 0);

    let matchesWon = 0;
    let matchesLost = 0;

    // Check each match the user participated in
    userScores.forEach((score) => {
      const matchScores = scoresByMatch[score.matchId];
      const highestScore = Math.max(...matchScores.map((s) => s.score));
      const lowestScore = Math.min(...matchScores.map((s) => s.score));

      if (score.score === highestScore) matchesWon++;
      if (score.score === lowestScore) matchesLost++;
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

  return { users: rankedData };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { users } = loaderData;

  return (
    <div>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matches Won
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matches Lost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ranking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1Up
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.displayName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.totalScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.matchesWon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.matchesLost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.ranking}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.oneUp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
