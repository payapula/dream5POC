## SpecStory

## Refactoring Chart Components and Filters (20/04/2025, 22:26:44)

_**User**_

In @chart.tsx , we have both charts added, one Line chart and other Bar chart. 

The user selection filter and data filter/selection logic is currently inside @HistoryChart.tsx . We are going to use the same filter and data for @VerticalBarChart.tsx as well.

We need to extract the common logic of pagination, <UserSelector /> filter and chart data filter to some common component at the top and pass down the data as is. We need to move <UserSelector /> as separate component on top of both of these cards. Please go the necessary updates.

---

_**Assistant**_



---

_****_

Okay, I understand the goal. We need to hoist the shared logic (data fetching, filtering, pagination, user selection) from `HistoryChart` to the parent `chart.tsx` route component. This will allow both `HistoryChart` and `VerticalBarChart` to use the same dynamic data and filters.

Here's the plan:

1.  **Create a new file `app/components/charts/ChartControls.tsx`**: This file will contain the `UserSelector` component, the `PaginationControls` component, and the shared `chartConfig`.
2.  **Update `app/routes/matches/chart.tsx`**: This component will now fetch the data, manage the state for selected users and pagination, perform data filtering/transformation, and render `UserSelector`, `PaginationControls`, `HistoryChart`, and `VerticalBarChart`, passing the necessary props down.
3.  **Refactor `app/components/charts/history/HistoryChart.tsx`**: Remove the duplicated logic and update it to accept data and configuration via props.
4.  **Refactor `app/components/charts/verticalBar/VerticalBarChart.tsx`**: Remove static data and update it to accept data and configuration via props, dynamically rendering the bars based on selected users.

Let's start by creating the `ChartControls.tsx` file.



---

_****_

```diff
- 
+ import { Button } from "@/components/ui/button";
+ import { Checkbox } from "@/components/ui/checkbox";
+ import { Label } from "@/components/ui/label";
+ import type { ChartConfig } from "@/components/ui/chart";
+ 
+ export const chartConfig = {
+   user1: {
+     label: "Assassino",
+     color: "var(--chart-1)",
+   },
+   user2: {
+     label: "Naveen",
+     color: "var(--chart-2)",
+   },
+   user3: {
+     label: "HP",
+     color: "var(--chart-3)",
+   },
+   user4: {
+     label: "BK",
+     color: "var(--chart-4)",
+   },
+   user5: {
+     label: "Bala",
+     color: "var(--chart-5)",
+   },
+ } satisfies ChartConfig;
+ 
+ export function PaginationControls({
+   currentPage,
+   totalPages,
+   onPageChange,
+ }: {
+   currentPage: number;
+   totalPages: number;
+   onPageChange: (page: number) => void;
+ }) {
+   return (
+     <div className="flex items-center justify-between gap-4 mt-6">
+       <Button
+         variant="outline"
+         size="sm"
+         onClick={() => onPageChange(currentPage - 1)}
+         disabled={currentPage <= 1}
+       >
+         Previous
+       </Button>
+       <span className="text-sm font-medium">
+         Page {currentPage} of {totalPages}
+       </span>
+       <Button
+         variant="outline"
+         size="sm"
+         onClick={() => onPageChange(currentPage + 1)}
+         disabled={currentPage >= totalPages}
+       >
+         Next
+       </Button>
+     </div>
+   );
+ }
+ 
+ export function UserSelector({
+   config,
+   selectedUsers,
+   onChange,
+ }: {
+   config: ChartConfig;
+   selectedUsers: string[];
+   onChange: (selected: string[]) => void;
+ }) {
+   const userKeys = Object.keys(config);
+   const allSelected = selectedUsers.length === userKeys.length;
+ 
+   const handleSelectAll = () => {
+     onChange(allSelected ? [] : [...userKeys]);
+   };
+ 
+   const handleUserToggle = (userId: string) => {
+     if (selectedUsers.includes(userId)) {
+       onChange(selectedUsers.filter((id) => id !== userId));
+     } else {
+       onChange([...selectedUsers, userId]);
+     }
+   };
+ 
+   return (
+     <div className="mb-4 mt-4">
+       <div className="flex items-center space-x-2 mb-6 px-2">
+         <Checkbox
+           id="select-all"
+           checked={allSelected}
+           onCheckedChange={handleSelectAll}
+         />
+         <Label htmlFor="select-all">All Users</Label>
+       </div>
+       <div className="grid grid-cols-3 gap-6">
+         {userKeys.map((userId) => (
+           <div key={userId} className="flex items-center space-x-2 p-2">
+             <Checkbox
+               id={userId}
+               checked={selectedUsers.includes(userId)}
+               onCheckedChange={() => handleUserToggle(userId)}
+             />
+             <Label htmlFor={userId} className="flex items-center">
+               <span
+                 className="w-3 h-3 rounded-full mr-1"
+                 style={{ backgroundColor: config[userId].color }}
+               />
+               {config[userId].label}
+             </Label>
+           </div>
+         ))}
+       </div>
+     </div>
+   );
+ } 
```

---

_****_

Great, the `ChartControls.tsx` file is created with the necessary components and config.

Now, let's refactor `app/components/charts/history/HistoryChart.tsx` to remove the duplicated logic and accept props.

---

_****_

```diff
  }
  
- export function HistoryChart() {
-   const rootData = useRouteLoaderData<MatchesLoaderData>(
-     "routes/matches/matchesRoot"
-   );
- 
-   if (!rootData?.matches) {
-     return <div>No matches found</div>;
-   }
- 
-   const { matches } = rootData;
- 
-   return <Chart matches={matches} />;
- }
- 
- export function Chart({ matches }: { matches: MatchesLoaderData["matches"] }) {
-   const userKeys = Object.keys(chartConfig);
-   const [selectedUsers, setSelectedUsers] = useState<string[]>(userKeys);
- 
-   // Add pagination state
-   const itemsPerPage = 5;
-   const validMatches = matches.filter(
-     (match) => match.winner.toLowerCase() !== "no winner"
-   );
-   const totalPages = Math.ceil(validMatches.length / itemsPerPage);
-   const [currentPage, setCurrentPage] = useState(totalPages); // Start from the most recent matches
- 
-   // Get paginated data - reverse order so newest matches show first
-   const getPaginatedMatches = () => {
-     const startIndex = validMatches.length - currentPage * itemsPerPage;
-     const safeStartIndex = Math.max(0, startIndex);
-     const endIndex = safeStartIndex + itemsPerPage;
- 
-     return validMatches
-       .reverse()
-       .slice(safeStartIndex, endIndex)
-       .map((match) => {
-         return match.userScores.map((userScore) => {
-           return {
-             match: match.number,
-             user: userScore.user.displayName,
-             userId: userScore.userId,
-             score: userScore.score,
-           };
-         });
-       })
-       .reverse();
-   };
- 
-   const filteredMatches = getPaginatedMatches();
- 
-   const convertedChartData = filteredMatches.map((match) => {
-     let matchData: { [key: string]: any } = {};
-     for (const user of match) {
-       matchData["match"] = user.match;
-       matchData[`user${user.userId}`] = user.score;
-     }
-     return matchData;
-   });
- 
-   const filteredData = convertedChartData.map((dataPoint) => {
-     const filteredPoint = { match: dataPoint.match };
-     selectedUsers.forEach((user) => {
-       //@ts-ignore
-       filteredPoint[user] = dataPoint[user];
-     });
-     return filteredPoint;
-   });
- 
-   const handlePageChange = (page: number) => {
-     setCurrentPage(page);
-   };
- 
+ export interface HistoryChartProps {
+   filteredData: any[];
+   selectedUsers: string[];
+   chartConfig: ChartConfig;
+ }
+ 
+ export function HistoryChart({ filteredData, selectedUsers, chartConfig }: HistoryChartProps) {
    return (
-     <Card className="py-4 mt-16">
+     <Card className="py-4 mt-8">
        <CardHeader>
          <CardTitle>Scores Trend</CardTitle>
        </CardHeader>
        <CardContent>
-         <UserSelector
-           config={chartConfig}
-           selectedUsers={selectedUsers}
-           onChange={setSelectedUsers}
-         />
          <ChartContainer config={chartConfig}>
            <LineChart
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
-             {selectedUsers.includes("user1") && (
+             {selectedUsers.map((userKey) => (
                <Line
-                 dataKey="user1"
+                 key={userKey}
+                 dataKey={userKey}
                  type="monotone"
-                 stroke="var(--chart-1)"
+                 stroke={chartConfig[userKey]?.color || "#000"}
                  strokeWidth={2}
                  dot={true}
                />
-             )}
-             {selectedUsers.includes("user2") && (
-               <Line
-                 dataKey="user2"
-                 type="monotone"
-                 stroke="var(--chart-2)"
-                 strokeWidth={2}
-                 dot={true}
-               />
-             )}
-             {selectedUsers.includes("user3") && (
-               <Line
-                 dataKey="user3"
-                 type="monotone"
-                 stroke="var(--chart-3)"
-                 strokeWidth={2}
-                 dot={true}
-               />
-             )}
-             {selectedUsers.includes("user4") && (
-               <Line
-                 dataKey="user4"
-                 type="monotone"
-                 stroke="var(--chart-4)"
-                 strokeWidth={2}
-                 dot={true}
-               />
-             )}
-             {selectedUsers.includes("user5") && (
-               <Line
-                 dataKey="user5"
-                 type="monotone"
-                 stroke="var(--chart-5)"
-                 strokeWidth={2}
-                 dot={true}
-               />
-             )}
+             ))}
            </LineChart>
          </ChartContainer>
- 
-         <PaginationControls
-           currentPage={currentPage}
-           totalPages={totalPages}
-           onPageChange={handlePageChange}
-         />
        </CardContent>
      </Card>
```

---

_****_



---

_****_

Okay, `HistoryChart` is refactored.

Now, let's apply similar changes to `app/components/charts/verticalBar/VerticalBarChart.tsx`. We'll remove the static data, accept props, and render the bars dynamically based on the `selectedUsers` prop.

---

_****_

```diff
    Card,
    CardContent,
-   CardDescription,
    CardHeader,
    CardTitle,
    ChartTooltipContent,
  } from "@/components/ui/chart";
- // const chartData = [
- //   { month: "January", desktop: 186, mobile: 80 },
- //   { month: "February", desktop: 305, mobile: 200 },
- //   { month: "March", desktop: 237, mobile: 120 },
- //   { month: "April", desktop: 73, mobile: 190 },
- //   { month: "May", desktop: 209, mobile: 130 },
- //   { month: "June", desktop: 214, mobile: 140 },
- // ];
- 
- const chartData = [
-   { match: 1, user1: 87, user2: 45, user3: 73, user4: 28, user5: 91 },
-   { match: 2, user1: 32, user2: 91, user3: 45, user4: 67, user5: 12 },
-   { match: 3, user1: 76, user2: 64, user3: 89, user4: 34, user5: 56 },
-   { match: 4, user1: 23, user2: 55, user3: 17, user4: 95, user5: 83 },
-   { match: 5, user1: 95, user2: 42, user3: 61, user4: 39, user5: 44 },
-   { match: 6, user1: 61, user2: 83, user3: 29, user4: 72, user5: 65 },
- ];
- 
- const chartConfig = {
-   user1: {
-     label: "Assassino",
-     color: "var(--chart-1)",
-   },
-   user2: {
-     label: "Naveen",
-     color: "var(--chart-2)",
-   },
-   user3: {
-     label: "HP",
-     color: "var(--chart-3)",
-   },
-   user4: {
-     label: "BK",
-     color: "var(--chart-4)",
-   },
-   user5: {
-     label: "Bala",
-     color: "var(--chart-5)",
-   },
- } satisfies ChartConfig;
- 
- export function VerticalBarChart() {
+ 
+ export interface VerticalBarChartProps {
+   filteredData: any[];
+   selectedUsers: string[];
+   chartConfig: ChartConfig;
+ }
+ 
+ export function VerticalBarChart({ filteredData, selectedUsers, chartConfig }: VerticalBarChartProps) {
    return (
      <Card className="mt-8">
        <CardHeader>
-         <CardTitle>Match History</CardTitle>
+         <CardTitle>Match Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
-           <BarChart accessibilityLayer data={chartData}>
+           <BarChart accessibilityLayer data={filteredData}>
              <CartesianGrid vertical={false} />
              <XAxis
                content={<ChartTooltipContent indicator="dashed" />}
              />
-             <Bar dataKey="user1" fill="var(--chart-1)" radius={4} />
-             <Bar dataKey="user2" fill="var(--chart-2)" radius={4} />
-             <Bar dataKey="user3" fill="var(--chart-3)" radius={4} />
-             <Bar dataKey="user4" fill="var(--chart-4)" radius={4} />
-             <Bar dataKey="user5" fill="var(--chart-5)" radius={4} />
+             {selectedUsers.map((userKey) => (
+               <Bar
+                 key={userKey}
+                 dataKey={userKey}
+                 fill={chartConfig[userKey]?.color || "#000"}
+                 radius={4}
+               />
+             ))}
            </BarChart>
          </ChartContainer>
```

---

_****_



---

_****_

Excellent, `VerticalBarChart` is now also refactored to accept props.

Finally, let's update the parent component `app/routes/matches/chart.tsx`. We'll add the data fetching, state management (`selectedUsers`, `currentPage`), data transformation logic, and render the `UserSelector`, `PaginationControls`, and the two refactored chart components, passing the processed data down.

---

_****_

```diff
+ import { useState } from "react";
+ import { useRouteLoaderData } from "react-router";
+ import {
+   UserSelector,
+   PaginationControls,
+   chartConfig,
+ } from "~/components/charts/ChartControls";
  import { HistoryChart } from "~/components/charts/history/HistoryChart";
  import { VerticalBarChart } from "~/components/charts/verticalBar/VerticalBarChart";
+ import type { MatchesLoaderData } from "~/routes/types/matches";
+ import { Card, CardContent } from "@/components/ui/card";
+ 
  export default function Chart() {
+   const rootData = useRouteLoaderData<MatchesLoaderData>(
+     "routes/matches/matchesRoot"
+   );
+ 
+   if (!rootData?.matches) {
+     return <div>No matches found</div>;
+   }
+ 
+   const { matches } = rootData;
+ 
+   const userKeys = Object.keys(chartConfig);
+   const [selectedUsers, setSelectedUsers] = useState<string[]>(userKeys);
+ 
+   const itemsPerPage = 5;
+   const validMatches = matches.filter(
+     (match) => match.winner.toLowerCase() !== "no winner"
+   );
+   const totalPages = Math.ceil(validMatches.length / itemsPerPage);
+   const [currentPage, setCurrentPage] = useState(totalPages > 0 ? totalPages : 1);
+ 
+   const getPaginatedMatches = () => {
+     const reversedMatches = [...validMatches].reverse();
+     const startIndex = (currentPage - 1) * itemsPerPage;
+     const endIndex = startIndex + itemsPerPage;
+     const paginated = reversedMatches.slice(startIndex, endIndex);
+ 
+     return paginated
+       .map((match) => {
+         return match.userScores.map((userScore) => {
+           return {
+             match: match.number,
+             user: userScore.user.displayName,
+             userId: userScore.userId,
+             score: userScore.score,
+           };
+         });
+       })
+       .reverse();
+   };
+ 
+   const paginatedUserScores = getPaginatedMatches();
+ 
+   const convertedChartData = paginatedUserScores.map((matchScores) => {
+     let matchData: { [key: string]: any } = {};
+     if (matchScores.length > 0) {
+       matchData["match"] = matchScores[0].match;
+       for (const user of matchScores) {
+         matchData[`user${user.userId}`] = user.score;
+       }
+     }
+     return matchData;
+   }).filter(data => Object.keys(data).length > 0);
+ 
+   const filteredData = convertedChartData.map((dataPoint) => {
+     const filteredPoint = { match: dataPoint.match };
+     selectedUsers.forEach((user) => {
+       filteredPoint[user] = dataPoint[user];
+     });
+     return filteredPoint;
+   });
+ 
+   const handlePageChange = (page: number) => {
+     setCurrentPage(page);
+   };
+ 
    return (
-     <div>
-       <HistoryChart />
-       <VerticalBarChart />
+     <div className="mt-4 px-4">
+       <Card>
+         <CardContent className="pt-6">
+           <UserSelector
+             config={chartConfig}
+             selectedUsers={selectedUsers}
+             onChange={setSelectedUsers}
+           />
+         </CardContent>
+       </Card>
+ 
+       <HistoryChart
+         filteredData={filteredData}
+         selectedUsers={selectedUsers}
+         chartConfig={chartConfig}
+       />
+ 
+       <VerticalBarChart
+         filteredData={filteredData}
+         selectedUsers={selectedUsers}
+         chartConfig={chartConfig}
+       />
+ 
+       <PaginationControls
+         currentPage={currentPage}
+         totalPages={totalPages}
+         onPageChange={handlePageChange}
+       />
      </div>
    );
```

---

_****_

All done!

We have successfully refactored the chart components:

1.  Created `app/components/charts/ChartControls.tsx` containing the shared `UserSelector`, `PaginationControls`, and `chartConfig`.
2.  Updated `app/components/charts/history/HistoryChart.tsx` to be a presentational component accepting props.
3.  Updated `app/components/charts/verticalBar/VerticalBarChart.tsx` to be a presentational component accepting props and rendering bars dynamically.
4.  Updated the route component `app/routes/matches/chart.tsx` to handle data fetching, state management (user selection, pagination), data transformation, and rendering the controls and chart components with the necessary props.

This structure centralizes the logic, reduces duplication, and makes the individual chart components reusable and easier to manage.

---

_**User**_

There is a typescript error of `Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ match: any; }'.
  No index signature with a parameter of type 'string' was found on type '{ match: any; }'` on line 74 in @chart.tsx , can you help me fix it?

---

_**Assistant**_



---

_****_




---

_****_



---

_****_

You are right, that TypeScript error occurs because we're trying to add properties to the `filteredPoint` object using a variable (`user`) as the key. TypeScript needs a more explicit definition of the object's structure to allow this.

We can fix this by adding an index signature to the type of `filteredPoint`. This tells TypeScript that the object can have arbitrary string keys that hold number values (the scores).

I'll apply this change to `app/routes/matches/chart.tsx`.

---

_****_

```diff
  
    const filteredData = convertedChartData.map((dataPoint) => {
-     const filteredPoint = { match: dataPoint.match };
+     const filteredPoint: { match: number; [key: string]: number | undefined } = { match: dataPoint.match };
      selectedUsers.forEach((user) => {
        filteredPoint[user] = dataPoint[user];
```

---

_****_

That should resolve the TypeScript error by explicitly telling the compiler that `filteredPoint` can have string keys corresponding to user IDs.

---



---

