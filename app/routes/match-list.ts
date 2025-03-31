import { prisma } from "~/utils/db.server";
import { data } from "react-router";

export async function loader() {
  const matches = await prisma.match.findMany({
    include: {
      homeTeam: {
        select: {
          name: true,
        },
      },
      awayTeam: {
        select: {
          name: true,
        },
      },
    },
  });
  return data(
    { matches },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
