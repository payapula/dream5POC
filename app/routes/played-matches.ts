import { prisma } from "~/utils/db.server";
import { data } from "react-router";
import type { Route } from "./+types/played-matches";

export async function loader({ params }: Route.LoaderArgs) {
  const matchId = params.matchId;

  /**
   * Retrieve all the user scores for the match
   */
  const userScores = await prisma.userScore.findMany({
    where: {
      matchId,
    },
  });

  return data(
    { userScores },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
