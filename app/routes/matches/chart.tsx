import { useState } from "react";
import { useRouteLoaderData } from "react-router";
import {
  UserSelector,
  PaginationControls,
  chartConfig,
} from "~/components/charts/ChartControls";
import { HistoryChart } from "~/components/charts/history/HistoryChart";
import { VerticalBarChart } from "~/components/charts/verticalBar/VerticalBarChart";
import type { MatchesLoaderData } from "~/routes/types/matches";
import { Card, CardContent } from "@/components/ui/card";

export default function Chart() {
  const rootData = useRouteLoaderData<MatchesLoaderData>(
    "routes/matches/matchesRoot"
  );

  if (!rootData?.matches) {
    return <div>No matches found</div>;
  }

  const { matches } = rootData;

  const userKeys = Object.keys(chartConfig);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(userKeys);

  const itemsPerPage = 5;
  const validMatches = matches.filter(
    (match) => match.winner.toLowerCase() !== "no winner"
  );
  const totalPages = Math.ceil(validMatches.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(
    totalPages > 0 ? totalPages : 1
  );

  const getPaginatedMatches = () => {
    const reversedMatches = [...validMatches];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = reversedMatches.slice(startIndex, endIndex);

    return paginated.map((match) => {
      return match.userScores.map((userScore) => {
        return {
          match: match.number,
          user: userScore.user.displayName,
          userId: userScore.userId,
          score: userScore.score,
        };
      });
    });
  };

  const paginatedUserScores = getPaginatedMatches();

  const convertedChartData = paginatedUserScores
    .map((matchScores) => {
      let matchData: { [key: string]: any } = {};
      if (matchScores.length > 0) {
        matchData["match"] = matchScores[0].match;
        for (const user of matchScores) {
          matchData[`user${user.userId}`] = user.score;
        }
      }
      return matchData;
    })
    .filter((data) => Object.keys(data).length > 0);

  const filteredData = convertedChartData.map((dataPoint) => {
    const filteredPoint: { match: number; [key: string]: number | undefined } =
      { match: dataPoint.match };
    selectedUsers.forEach((user) => {
      filteredPoint[user] = dataPoint[user];
    });
    return filteredPoint;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="mt-4 px-4">
      <Card>
        <CardContent className="pt-6">
          <UserSelector
            config={chartConfig}
            selectedUsers={selectedUsers}
            onChange={setSelectedUsers}
          />
        </CardContent>
      </Card>

      <HistoryChart
        filteredData={filteredData}
        selectedUsers={selectedUsers}
        chartConfig={chartConfig}
      />

      <VerticalBarChart
        filteredData={filteredData}
        selectedUsers={selectedUsers}
        chartConfig={chartConfig}
      />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
