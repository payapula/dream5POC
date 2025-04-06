import { columns } from "./columns";
import { DataTable } from "./data-table";
import type { loader as MatchesLoader } from "~/routes/matches";
import { useLoaderData } from "react-router";

export function MatchesCard() {
  const { matches } = useLoaderData<typeof MatchesLoader>();
  console.log("matches", matches);

  return (
    <div className="container mx-auto">
      <div className="text-sm text-gray-500 mb-4">
        Total Matches: {matches.length}
      </div>
      <DataTable columns={columns} data={matches} />
    </div>
  );
}
