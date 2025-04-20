import { columns } from "./columns";
import { DataTable } from "./data-table";
import type { loader as DashboardLoader } from "~/routes/resource/dashboard";

export function ScoreCard({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof DashboardLoader>>;
}) {
  const { users, totalMatches } = loaderData;

  return (
    <div className="container mx-auto">
      <div className="text-sm text-gray-500 mb-4">
        Total Matches Completed: {totalMatches}
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
