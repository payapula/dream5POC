import { columns } from "./columns";
import { DataTable } from "./data-table";
import type { loader as DashboardLoader } from "~/routes/resource/dashboard";

export function ScoreCard({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof DashboardLoader>>;
}) {
  const { users, totalMatchesPlayed, remainingMatches } = loaderData;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-baseline mb-4">
        <div className="text-sm mb-4 text-green-600">
          Played: {totalMatchesPlayed}
        </div>
        <div className="text-sm mb-4 text-red-600">
          Remaining: {remainingMatches}
        </div>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
