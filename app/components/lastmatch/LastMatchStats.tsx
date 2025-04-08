import { useLoaderData } from "react-router";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { loader as DashboardLoader } from "~/routes/dashboard";

export function LastMatchStats() {
  const { lastMatch } = useLoaderData<typeof DashboardLoader>();

  if (!lastMatch) {
    return (
      <Card className="mb-6 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Latest Match</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No matches found yet.</p>
        </CardContent>
      </Card>
    );
  }

  const matchDate = new Date(lastMatch.date);

  return (
    <Card className="mb-6 bg-white shadow-sm mt-4 gap-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-center">
          Last Match Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-500 text-center">
              {matchDate.toLocaleDateString()}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="font-medium">{lastMatch.homeTeam.name}</p>
              </div>
              <div className="text-xs px-2">vs</div>
              <div className="text-center flex-1">
                <p className="font-medium">{lastMatch.awayTeam.name}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-medium mb-2 text-center">
              Top Performers
            </p>
            <div className="space-y-2">
              {lastMatch.userScores
                //@ts-expect-error
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map((score, index) => (
                  <div
                    //@ts-expect-error
                    key={score.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {index === 0 && (
                        <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
                      )}
                      <span
                        className={`text-sm ${
                          index === 0 ? "bg-yellow-100 px-1 -mx-1" : ""
                        }`}
                      >
                        {/* @ts-expect-error */}
                        {score.user.displayName}
                      </span>
                    </div>
                    <span className="font-medium">
                      {/* @ts-expect-error */}
                      {score.score.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
