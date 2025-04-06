## SpecStory

## Building Match Result View Page (06/04/2025, 18:30:48)

_**User**_

Now let's build the match "Match Result View" page. ("match/:matchId" route)

We will concentrate about building only the results view (DataTable) for now. Do not add ability to update the match result.

We will display a datatable with the scores of all the users, their rank for that match. We will take matchId from the params `params.matchId`

Let's follow the structure of table like in @matches.tsx page and @dashboard.tsx page. Please refer to the @schema.prisma and @design_doc.md for details on what to show on this page. Let's do update in files 2 at a time in a step by step manner.

---

_**Assistant**_

Let's build the match result view step by step. First, I'll update the match loader and component:

```typescript:app/routes/match.tsx
import type { Route } from "./+types/match";
import { prisma } from "~/utils/db.server";
import { MatchResultCard } from "~/components/match/matchresultcard";

export async function loader({ params }: Route.LoaderArgs) {
  const { matchId } = params;
  
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      userScores: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!match) {
    throw new Response("Match not found", { status: 404 });
  }

  // Sort user scores by score in descending order
  const sortedScores = [...match.userScores].sort((a, b) => b.score - a.score);
  
  // Process data to include ranking and 1Up values
  const userResults = sortedScores.map((score, index) => {
    // Calculate the 1Up (points needed to reach the rank above)
    const oneUp = index > 0 ? sortedScores[index - 1].score - score.score : 0;
    
    return {
      id: score.user.id,
      name: score.user.displayName,
      score: score.score,
      rank: index + 1,
      oneUp: Number(oneUp.toFixed(1)),
    };
  });

  const matchDetails = {
    id: match.id,
    number: match.matchNumber,
    date: match.date,
    details: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    winner: sortedScores[0]?.user.displayName || "No winner",
  };

  return { match: matchDetails, results: userResults };
}

export default function Match({ loaderData }: Route.ComponentProps) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Match Result</h1>
      <MatchResultCard matchData={loaderData} />
    </div>
  );
}
```

Now let's create the MatchResultCard component:

```typescript:app/components/match/matchresultcard.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type MatchResultCardProps = {
  matchData: {
    match: {
      id: string;
      number: string;
      date: string;
      details: string;
      winner: string;
    };
    results: Array<{
      id: string;
      name: string;
      score: number;
      rank: number;
      oneUp: number;
    }>;
  };
};

export function MatchResultCard({ matchData }: MatchResultCardProps) {
  const { match, results } = matchData;

  return (
    <div className="space-y-4">
      {/* Match details card */}
      <Card>
        <CardHeader>
          <CardTitle>Match #{match.number}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Teams:</div>
            <div>{match.details}</div>
            <div className="font-medium">Date:</div>
            <div>{new Date(match.date).toLocaleDateString()}</div>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">1Up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.rank}</TableCell>
                  <TableCell>{result.name}</TableCell>
                  <TableCell className="text-right">{result.score}</TableCell>
                  <TableCell className="text-right">{result.oneUp > 0 ? result.oneUp : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

_**User**_

Let's update the Table in @matchresultcard.tsx to use the DataTable just like in @matches.tsx  and @dashboard.tsx . 

Let's create new datatable under /components/matchresultcard. Use similar structure of table as columns, data-table.tsx, etc. 

---

_**Assistant**_

Let's create the DataTable components for the match result view. First, I'll create the columns definition file:

```typescript:app/components/match/columns.tsx
import { ColumnDef } from "@tanstack/react-table";

export type UserResult = {
  id: string;
  name: string;
  score: number;
  rank: number;
  oneUp: number;
};

export const columns: ColumnDef<UserResult>[] = [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => <div className="font-medium w-12">{row.getValue("rank")}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => <div className="text-right">{row.getValue("score")}</div>,
  },
  {
    accessorKey: "oneUp",
    header: "1Up",
    cell: ({ row }) => {
      const oneUp = row.getValue("oneUp") as number;
      return <div className="text-right">{oneUp > 0 ? oneUp : "-"}</div>;
    },
  },
];
```

Now let's create the DataTable component:

```typescript:app/components/match/data-table.tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

Now, let's update the MatchResultCard to use our new DataTable:

```typescript:app/components/match/matchresultcard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";

type MatchResultCardProps = {
  matchData: {
    match: {
      id: string;
      number: string;
      date: Date;
      details: string;
      winner: string;
    };
    results: Array<{
      id: string;
      name: string;
      score: number;
      rank: number;
      oneUp: number;
    }>;
  };
};

export function MatchResultCard({ matchData }: MatchResultCardProps) {
  const { match, results } = matchData;

  return (
    <div className="space-y-4">
      {/* Match details card */}
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
```

---



---

