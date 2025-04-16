## SpecStory

## Pagination Controls for Chart Data (16/04/2025, 21:24:17)

_**User**_

Let's implement pagination controls to view the chart data.

Let's add previous and next buttons below the chart. Clicking them should show previous 5 matches or next 5 matches respectively. Note that pagination should work along with the `selectedUsers` filter. 

Make sure to follow best practices and create components for pagination in a separate file.

---

_**Assistant**_



---

_****_

I'll create a separate pagination component and implement the pagination controls for the chart. Here's how we'll do it:

First, let's create a new file for the pagination component:

```tsx:app/components/charts/history/Pagination.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-between items-center mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 0}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <span className="text-sm text-muted-foreground">
        Page {currentPage + 1} of {Math.max(1, totalPages)}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

Now, let's update the `HistoryChart.tsx` file to include pagination:

```149:201:app/components/charts/history/HistoryChart.tsx
  const userKeys = Object.keys(chartConfig);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(userKeys);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  
  // Filter matches that have a winner
  const matchesWithWinner = matches.filter(
    (match) => match.winner.toLowerCase() !== "no winner"
  );
  
  const totalPages = Math.ceil(matchesWithWinner.length / itemsPerPage);
  
  // Get the paginated matches
  const paginatedMatches = matchesWithWinner
    .slice(
      Math.max(0, matchesWithWinner.length - (currentPage + 1) * itemsPerPage),
      Math.max(0, matchesWithWinner.length - currentPage * itemsPerPage)
    )
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
    
  const convertedChartData = paginatedMatches.map((match) => {
    let matchData: { [key: string]: any } = {};
    for (const user of match) {
      matchData["match"] = user.match;
      matchData[`user${user.userId}`] = user.score;
    }
    return matchData;
  });
```

Then let's add the pagination component to the card footer:

```220:228:app/components/charts/history/HistoryChart.tsx
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </CardFooter>
    </Card>
```

Finally, add the import for the Pagination component:

```3:10:app/components/charts/history/HistoryChart.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "./Pagination";
```

This implementation:
1. Creates a reusable Pagination component with Previous/Next buttons
2. Adds pagination state to the Chart component
3. Slices the data based on current page instead of showing just the last 5 matches
4. Shows page indicators to help users navigate
5. Preserves the user filtering functionality while adding pagination

---

_**User**_

Added this but we need to make one update, the `matches` data we have will contain the matches in the order 1 to latest. On the first load we will show the last 5 data and disable the "Next" button. When user clicks previous, we will show previous 5 matches data in chart and enable the next button. Basically we need to reverse the pagination. Can we do that update?

---

_**Assistant**_



---

_****_

Let's update the HistoryChart.tsx file to reverse the pagination logic:

```132:169:app/components/charts/history/HistoryChart.tsx
  const matchesWithWinner = matches.filter(
    (match) => match.winner.toLowerCase() !== "no winner"
  );

  const totalPages = Math.ceil(matchesWithWinner.length / itemsPerPage);
  
  // Calculate start and end indices for pagination
  // We're showing newest matches first and going backward in time
  const endIndex = matchesWithWinner.length - (currentPage * itemsPerPage);
  const startIndex = Math.max(0, endIndex - itemsPerPage);
  
  // Get the paginated matches (showing newest first)
  const paginatedMatches = matchesWithWinner
    .slice(startIndex, endIndex)
    .reverse() // Reverse to show most recent first within the page
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

  const convertedChartData = paginatedMatches.map((match) => {
    let matchData: { [key: string]: any } = {};
    for (const user of match) {
      matchData["match"] = user.match;
      matchData[`user${user.userId}`] = user.score;
    }
    return matchData;
  });
```

The updated pagination logic now:
1. Shows the newest matches first (last 5 matches on first load)
2. Going to previous page shows older matches
3. When on the first page (newest matches), the "Next" button will be disabled
4. When viewing older matches, the "Next" button will let users navigate back to newer matches

---

_**User**_

We need to update the current page to update the pagination controls. On first load, if we have 15 matches, the page number will be 3. When user clicks previous, the currentpage will be 2 and so on.

---

_**Assistant**_



---

_****_

Let's update the currentPage initialization and pagination logic:

```128:143:app/components/charts/history/HistoryChart.tsx
  const userKeys = Object.keys(chartConfig);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(userKeys);
  const itemsPerPage = 5;
  
  // Filter matches that have a winner
  const matchesWithWinner = matches.filter(
    (match) => match.winner.toLowerCase() !== "no winner"
  );
  
  const totalPages = Math.ceil(matchesWithWinner.length / itemsPerPage);
  
  // Initialize currentPage to the last page on first render
  const [currentPage, setCurrentPage] = useState(totalPages - 1);
  
  // Calculate start and end indices for pagination
  // We're showing newest matches first and going backward in time
  const endIndex = (currentPage + 1) * itemsPerPage;
  const startIndex = currentPage * itemsPerPage;
```

Now let's update the data slicing logic to match this reversed page numbering:

```145:151:app/components/charts/history/HistoryChart.tsx
  // Get the paginated matches (showing newest first)
  const paginatedMatches = matchesWithWinner
    .slice(startIndex, Math.min(endIndex, matchesWithWinner.length))
    .map((match) => {
      return match.userScores.map((userScore) => {
        // ... existing code ...
```

Finally, let's update the Pagination component for reversed navigation:

```tsx:app/components/charts/history/Pagination.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-between items-center mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <span className="text-sm text-muted-foreground">
        Page {totalPages - currentPage} of {Math.max(1, totalPages)}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 0}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

This implementation:
1. Initializes currentPage to start from the last page (newest matches)
2. Updates the pagination controls to show "Previous" for older matches and "Next" for newer matches
3. Correctly calculates page numbers for display
4. Properly slices the match data for each page

---



---

