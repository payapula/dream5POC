import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouteLoaderData } from "react-router";
import type { MatchesLoaderData } from "~/routes/types/matches";
import { Button } from "@/components/ui/button";

const chartData = [
  { match: 1, user1: 87, user2: 45, user3: 73, user4: 28, user5: 91 },
  { match: 2, user1: 32, user2: 91, user3: 45, user4: 67, user5: 12 },
  { match: 3, user1: 76, user2: 64, user3: 89, user4: 34, user5: 56 },
  { match: 4, user1: 23, user2: 55, user3: 17, user4: 95, user5: 83 },
  { match: 5, user1: 95, user2: 42, user3: 61, user4: 39, user5: 44 },
  { match: 6, user1: 61, user2: 83, user3: 29, user4: 72, user5: 65 },
];

const chartConfig = {
  user1: {
    label: "Assassino",
    color: "var(--chart-1)",
  },
  user2: {
    label: "Naveen",
    color: "var(--chart-2)",
  },
  user3: {
    label: "HP",
    color: "var(--chart-3)",
  },
  user4: {
    label: "BK",
    color: "var(--chart-4)",
  },
  user5: {
    label: "Bala",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

// Create a Pagination component
function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>
      <span className="text-sm font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
}

// Create a UserSelector component
function UserSelector({
  config,
  selectedUsers,
  onChange,
}: {
  config: ChartConfig;
  selectedUsers: string[];
  onChange: (selected: string[]) => void;
}) {
  const userKeys = Object.keys(config);
  const allSelected = selectedUsers.length === userKeys.length;

  const handleSelectAll = () => {
    onChange(allSelected ? [] : [...userKeys]);
  };

  const handleUserToggle = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onChange(selectedUsers.filter((id) => id !== userId));
    } else {
      onChange([...selectedUsers, userId]);
    }
  };

  return (
    <div className="mb-4 mt-4">
      <div className="flex items-center space-x-2 mb-6 px-2">
        <Checkbox
          id="select-all"
          checked={allSelected}
          onCheckedChange={handleSelectAll}
        />
        <Label htmlFor="select-all">All Users</Label>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {userKeys.map((userId) => (
          <div key={userId} className="flex items-center space-x-2 p-2">
            <Checkbox
              id={userId}
              checked={selectedUsers.includes(userId)}
              onCheckedChange={() => handleUserToggle(userId)}
            />
            <Label htmlFor={userId} className="flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: config[userId].color }}
              />
              {config[userId].label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoryChart() {
  const rootData = useRouteLoaderData<MatchesLoaderData>(
    "routes/matches/matchesRoot"
  );

  if (!rootData?.matches) {
    return <div>No matches found</div>;
  }

  const { matches } = rootData;

  return <Chart matches={matches} />;
}

export function Chart({ matches }: { matches: MatchesLoaderData["matches"] }) {
  const userKeys = Object.keys(chartConfig);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(userKeys);

  // Add pagination state
  const itemsPerPage = 5;
  const validMatches = matches.filter(
    (match) => match.winner.toLowerCase() !== "no winner"
  );
  const totalPages = Math.ceil(validMatches.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(totalPages); // Start from the most recent matches

  // Get paginated data - reverse order so newest matches show first
  const getPaginatedMatches = () => {
    const startIndex = validMatches.length - currentPage * itemsPerPage;
    const safeStartIndex = Math.max(0, startIndex);
    const endIndex = safeStartIndex + itemsPerPage;

    return validMatches
      .reverse()
      .slice(safeStartIndex, endIndex)
      .map((match) => {
        return match.userScores.map((userScore) => {
          return {
            match: match.number,
            user: userScore.user.displayName,
            userId: userScore.userId,
            score: userScore.score,
          };
        });
      })
      .reverse();
  };

  const filteredMatches = getPaginatedMatches();

  const convertedChartData = filteredMatches.map((match) => {
    let matchData: { [key: string]: any } = {};
    for (const user of match) {
      matchData["match"] = user.match;
      matchData[`user${user.userId}`] = user.score;
    }
    return matchData;
  });

  const filteredData = convertedChartData.map((dataPoint) => {
    const filteredPoint = { match: dataPoint.match };
    selectedUsers.forEach((user) => {
      //@ts-ignore
      filteredPoint[user] = dataPoint[user];
    });
    return filteredPoint;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card className="py-4 mt-16">
      <CardHeader>
        <CardTitle>Scores Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <UserSelector
          config={chartConfig}
          selectedUsers={selectedUsers}
          onChange={setSelectedUsers}
        />
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="match"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {selectedUsers.includes("user1") && (
              <Line
                dataKey="user1"
                type="monotone"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={true}
              />
            )}
            {selectedUsers.includes("user2") && (
              <Line
                dataKey="user2"
                type="monotone"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={true}
              />
            )}
            {selectedUsers.includes("user3") && (
              <Line
                dataKey="user3"
                type="monotone"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={true}
              />
            )}
            {selectedUsers.includes("user4") && (
              <Line
                dataKey="user4"
                type="monotone"
                stroke="var(--chart-4)"
                strokeWidth={2}
                dot={true}
              />
            )}
            {selectedUsers.includes("user5") && (
              <Line
                dataKey="user5"
                type="monotone"
                stroke="var(--chart-5)"
                strokeWidth={2}
                dot={true}
              />
            )}
          </LineChart>
        </ChartContainer>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </CardContent>
    </Card>
  );
}
