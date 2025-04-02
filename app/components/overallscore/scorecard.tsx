import { useLoaderData } from "react-router";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import type { loader as DashboardLoader } from "~/routes/dashboard";

export function ScoreCard() {
  const { users } = useLoaderData<typeof DashboardLoader>();

  return (
    <div className="container mx-auto">
      <DataTable columns={columns} data={users} />
    </div>
  );
}
