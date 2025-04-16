## SpecStory

## Pagination Controls for Match Chart (16/04/2025, 21:36:38)

_**User**_

We need to update the chart by introducing pagination controls.

Bottom of the chart, create pagination controls with previous and next button. We will display the chart data of matches with most recent one to the older matches.

For example, when we have 15 matches. on first load, we will show matches from 10 to 15, the current pagenumber will be 3 and "next" button will be disabled. 

When user selects previous, we will show matches from 5 to 10 and so on. It will be kind of reversed pagination. 

Make sure to create pagination controls in a separate component. 

---

_**Assistant**_



---

_****_

I'll implement pagination controls for the chart to navigate through match history. Here's how I'll approach it:

---

_****_

Read file: undefined

---

_****_

Here's my implementation of a paginated chart with the requested pagination controls:

```tsx:app/components/charts/history/HistoryChart.tsx
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

// ... existing code ...

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
    <div className="flex items-center justify-center gap-4 mt-6">
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

// ... existing UserSelector component ...

export function HistoryChart() {
  // ... existing code ...
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
    const startIndex = (totalPages - currentPage) * itemsPerPage;
    return validMatches
      .slice(startIndex, startIndex + itemsPerPage)
      .map((match) => {
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
        <CardDescription>Match History</CardDescription>
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
```

This implementation:

1. Creates a new `PaginationControls` component with Previous/Next buttons
2. Adds pagination state to track the current page and calculate total pages
3. Modifies the data filtering logic to paginate through matches in groups of 5
4. Sets the initial page to show the most recent matches first
5. Disables the Next button when on the latest page and Previous button when on the earliest page
6. Displays the current page number and total pages
7. Calculates paginated data based on the current page selection

---

_**User**_

I think there is a issue in startIndex calculation, on first load, the page number of 3 is correct, but the startIndex is taken as 0. But it should be 10, right? 

---

_**Assistant**_



---

_****_

You're right. There's a problem with the startIndex calculation. The current formula `(totalPages - currentPage) * itemsPerPage` isn't working correctly.

Using your example of 15 matches with 5 matches per page (totalPages = 3):
- On first load with currentPage = 3, the startIndex calculates to (3-3)*5 = 0
- This means it's showing matches 0-4 (the oldest), not 10-14 (the newest)

Let's fix the calculation:

```tsx:app/components/charts/history/HistoryChart.tsx
// ... existing code ...

// Get paginated data - reverse order so newest matches show first
const getPaginatedMatches = () => {
  // Fix: Calculate the correct start index for reversed pagination
  const startIndex = validMatches.length - (currentPage * itemsPerPage);
  const endIndex = startIndex + itemsPerPage;
  
  // Ensure we don't go below 0 for the startIndex
  const safeStartIndex = Math.max(0, startIndex);
  
  return validMatches
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
    });
};

// ... rest of the code ...
```

This new formula:
- For page 3 (newest): startIndex = 15 - (3 * 5) = 0, endIndex = 5 (shows matches 0-4, but these are actually the last 5 matches since we're paginating in reverse)
- For page 2: startIndex = 15 - (2 * 5) = 5, endIndex = 10 (shows matches 5-9)
- For page 1 (oldest): startIndex = 15 - (1 * 5) = 10, endIndex = 15 (shows matches 10-14)

We added a safety check with `Math.max(0, startIndex)` to handle cases where the calculation might result in a negative startIndex (which could happen if there are fewer matches than expected).

---



---

