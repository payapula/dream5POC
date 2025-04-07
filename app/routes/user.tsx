import { useLoaderData } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DataTable } from "~/components/user/matches-data-table";
import { columns } from "~/components/user/matches-columns";
import type { UserMatch } from "~/components/user/matches-columns";
import { prisma } from "~/utils/db.server";

export default function UserDetails() {
  const { user, matchesPlayed } = useLoaderData<typeof loader>();

  return (
    <div className="container py-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">User Details</h1>

      <Card className="mx-4">
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Display Name:</div>
            <div>{user.displayName}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="mx-4">
        <CardHeader>
          <CardTitle>Matches Played</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={matchesPlayed} />
        </CardContent>
      </Card>
    </div>
  );
}

export async function loader({ params }: { params: { userId: string } }) {
  const userId = params.userId;

  // Fetch the user from the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      displayName: true,
    },
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  // Fetch the matches played by the user
  const userScores = await prisma.userScore.findMany({
    where: { userId },
    select: {
      id: true,
      score: true,
      match: {
        select: {
          id: true,
          matchNumber: true,
        },
      },
    },
  });

  // Convert to the expected format and sort by matchNumber numerically
  const matchesPlayed: UserMatch[] = userScores
    .map((score) => ({
      id: score.match.id,
      matchNumber: parseInt(score.match.matchNumber),
      points: score.score,
    }))
    .sort((a, b) => a.matchNumber - b.matchNumber); // Sort in ascending order

  return { user, matchesPlayed };
}
