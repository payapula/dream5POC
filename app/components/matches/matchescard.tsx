import { columns } from "./columns";
import { DataTable } from "./data-table";
import type { loader as MatchesLoader } from "~/routes/matches/matchesRoot";
import { useRouteLoaderData } from "react-router";

export function MatchesCard() {
  const rootData = useRouteLoaderData<typeof MatchesLoader>(
    "routes/matches/matchesRoot"
  );

  if (!rootData) {
    return <div>No matches found</div>;
  }

  const { matches } = rootData;

  return (
    <div className="container mx-auto">
      <div className="text-sm text-gray-500 mb-4">
        Total Matches: {matches.length}
      </div>
      <DataTable columns={columns} data={matches} />
    </div>
  );
}
