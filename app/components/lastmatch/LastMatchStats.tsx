import { Link, useLoaderData } from "react-router";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { DashboardLoaderData } from "~/routes/types/dashboard";

export function LastMatchStats() {
  const { lastMatch } = useLoaderData<DashboardLoaderData>();

  if (!lastMatch) {
    return (
      <Card className="mb-6 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Last Match</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No matches found yet.</p>
        </CardContent>
      </Card>
    );
  }

  const matchDate = new Date(lastMatch.date);

  // Sort and get top 3 performers
  const topPerformers = [...lastMatch.userScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <Card className="mb-6 bg-white shadow-sm mt-4 gap-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-center">
          Last Match Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col">
            <Link
              to={`/match/${lastMatch.matchNumber}`}
              prefetch="viewport"
              className="text-sm text-blue-600 hover:underline text-center transition-colors"
            >
              {matchDate.toLocaleDateString()}
            </Link>
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

          <div className="border-t pt-6">
            <p className="text-sm font-medium mb-8 text-center">
              Top Performers
            </p>

            {/* Trophy icon above the first place winner */}
            <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
              <Trophy className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>

            {/* Podium Section */}
            <div className="relative h-40 flex items-end justify-center top-5">
              {/* Second Place - Left */}
              {topPerformers.length > 1 && (
                <div className="absolute left-2 bottom-0 w-1/3 flex flex-col items-center animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-gray-200 flex items-center justify-center overflow-hidden mb-2 relative">
                    <span className="text-xs font-bold">2</span>
                    <div className="absolute inset-0 bg-silver opacity-30 animate-pulse"></div>
                  </div>
                  <p className="text-xs text-center font-medium truncate w-full">
                    {topPerformers[1]?.user.displayName}
                  </p>
                  <p className="text-xs font-semibold mb-1">
                    {topPerformers[1]?.score.toLocaleString("en-IN")}
                  </p>
                  <div className="w-full bg-gray-200 h-16 rounded-t-lg"></div>
                </div>
              )}

              {/* First Place - Center */}
              {topPerformers.length > 0 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-1/3 flex flex-col items-center z-10 animate-bounce-in">
                  <div className="w-14 h-14 rounded-full bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center overflow-hidden mb-2 relative">
                    <span className="text-xs font-bold">1</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-yellow-400 opacity-30 animate-shine"></div>
                  </div>
                  <p className="text-xs text-center font-medium truncate w-full">
                    {topPerformers[0]?.user.displayName}
                  </p>
                  <p className="text-xs font-semibold mb-1">
                    {topPerformers[0]?.score.toLocaleString("en-IN")}
                  </p>
                  <div className="w-full bg-yellow-200 h-24 rounded-t-lg relative">
                    <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-r from-yellow-100 to-yellow-300 opacity-50 animate-shimmer"></div>
                  </div>
                </div>
              )}

              {/* Third Place - Right */}
              {topPerformers.length > 2 && (
                <div className="absolute right-2 bottom-0 w-1/3 flex flex-col items-center animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center overflow-hidden mb-2 relative">
                    <span className="text-xs font-bold">3</span>
                    <div className="absolute inset-0 bg-bronze opacity-30 animate-pulse"></div>
                  </div>
                  <p className="text-xs text-center font-medium truncate w-full">
                    {topPerformers[2]?.user.displayName}
                  </p>
                  <p className="text-xs font-semibold mb-1">
                    {topPerformers[2]?.score.toLocaleString("en-IN")}
                  </p>
                  <div className="w-full bg-orange-100 h-12 rounded-t-lg"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
