import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useLoaderData } from "react-router";
import type { loader as MatchLoader } from "~/routes/match";

export function MatchResultCard() {
  const { match, results } = useLoaderData<typeof MatchLoader>();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Match #{match.number}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Teams:</div>
            <div>{match.details}</div>
            <div className="font-medium">Date:</div>
            <div>{match.date.toLocaleDateString()}</div>
            <div className="font-medium">Winner:</div>
            <div className="font-bold text-primary">{match.winner}</div>
          </div>
        </CardContent>
      </Card>

      {/* Results table */}
      <Card>
        <CardHeader>
          <CardTitle>Match Results</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={results} />
        </CardContent>
      </Card>
    </div>
  );
}
