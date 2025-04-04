import { useLoaderData } from "react-router";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import type { loader as DashboardLoader } from "~/routes/dashboard";

export function ScoreCard() {
  const { users, totalMatches } = useLoaderData<typeof DashboardLoader>();

  return (
    <div className="container mx-auto">
      <div className="text-sm text-gray-500 mb-4">
        Total Matches Completed: {totalMatches}
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
