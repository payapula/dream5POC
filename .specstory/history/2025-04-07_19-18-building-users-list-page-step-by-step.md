## SpecStory

## Building Users List Page Step by Step (07/04/2025, 19:18:30)

_**User**_

Let's start building users list page as per @design_doc_2.md  

We will follow the similar strucuture of other routes, and for datatable, we will create a similar one like @overallscore and @matchresultcard.tsx .

Keep the UI look and feel similar to other pages in the codebase. Let's do file updates 3 at a time, and will do this step by step manner.

---

_**Assistant**_

I'll help you build the users list page step by step. Let's start with the first 3 files:

1. First, let's uncomment the user route in routes.ts:

```typescript:app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("matches", "routes/matches.tsx"),
  route("match/:matchId", "routes/match.tsx"),

  /**
   * Users
   */
  route("users", "routes/users.tsx"),
  route("user/:userId", "routes/user.tsx"),

  /**
   * Resource Routes
   */
  route("match-list", "routes/match-list.ts"),
  route("played-matches/:matchId", "routes/played-matches.ts"),
] satisfies RouteConfig;
```

2. Now, let's create the users route file:

```typescript:app/routes/users.tsx
import { UserListCard } from "~/components/user/userlistcard";

export default function Users() {
  return (
    <div className="container py-4 space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <UserListCard />
    </div>
  );
}

export async function loader() {
  // Mock data for now
  const users = [
    { id: "1", name: "John Doe", displayName: "JDoe" },
    { id: "2", name: "Jane Smith", displayName: "JSmith" },
    { id: "3", name: "Alex Johnson", displayName: "AJ" },
    { id: "4", name: "Sam Wilson", displayName: "SamW" },
    { id: "5", name: "Taylor Reed", displayName: "TReed" },
  ];

  return { users };
}
```

3. Let's create the UserListCard component:

```typescript:app/components/user/userlistcard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useLoaderData } from "react-router";
import type { loader as UsersLoader } from "~/routes/users";

export function UserListCard() {
  const { users } = useLoaderData<typeof UsersLoader>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>User List</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={users} />
      </CardContent>
    </Card>
  );
}
```

---

_**User**_

Lets go to next set of files

---

_**Assistant**_

Let's create the missing files for the user component. I'll create the data-table.tsx, columns.tsx, and start the user.tsx route file:

```typescript:app/components/user/data-table.tsx
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

```typescript:app/components/user/columns.tsx
import { Link } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";

// This type represents your user data structure
export type User = {
  id: string;
  name: string;
  displayName: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const userId = row.original.id;
      const name = row.getValue("name") as string;
      
      return (
        <Link 
          to={`/user/${userId}`} 
          className="text-primary hover:underline"
        >
          {name}
        </Link>
      );
    },
  },
  {
    accessorKey: "displayName",
    header: "Display Name",
  },
];
```

```typescript:app/routes/user.tsx
import { useLoaderData } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DataTable } from "~/components/user/matches-data-table";
import { columns } from "~/components/user/matches-columns";

export default function UserDetails() {
  const { user, matchesPlayed } = useLoaderData<typeof loader>();

  return (
    <div className="container py-4 space-y-4">
      <h1 className="text-2xl font-bold">User Details</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Display Name:</div>
            <div>{user.displayName}</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Matches Played</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={matchesPlayed} />
        </CardContent>
      </Card>
    </div>
  );
}

export async function loader({ params }: { params: { userId: string } }) {
  const userId = params.userId;
  
  // Mock data for now
  const user = {
    id: userId,
    name: "John Doe",
    displayName: "JDoe",
  };
  
  const matchesPlayed = [
    { id: "1", matchNumber: 101, points: 85 },
    { id: "2", matchNumber: 102, points: 92 },
    { id: "3", matchNumber: 105, points: 78 },
  ];
  
  return { user, matchesPlayed };
}
```

---

_**User**_

Let's update next set of files

---

_**Assistant**_

Let's fix the current linter error and create the missing files for the user matches table. We need to create the matches columns file and update the user route:

```typescript:app/components/user/matches-columns.tsx
import { type ColumnDef } from "@tanstack/react-table";

// This type represents the matches played by a user
export type UserMatch = {
  id: string;
  matchNumber: number;
  points: number;
};

export const columns: ColumnDef<UserMatch>[] = [
  {
    accessorKey: "matchNumber",
    header: "Match Number",
  },
  {
    accessorKey: "points",
    header: "Points",
  },
];
```

```typescript:app/components/user/matches-data-table.tsx
import {
  type ColumnDef,
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

```typescript:app/routes/user.tsx
import { useLoaderData } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DataTable } from "~/components/user/matches-data-table";
import { columns } from "~/components/user/matches-columns";
import type { UserMatch } from "~/components/user/matches-columns";

export default function UserDetails() {
  const { user, matchesPlayed } = useLoaderData<typeof loader>();

  return (
    <div className="container py-4 space-y-4">
      <h1 className="text-2xl font-bold">User Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Display Name:</div>
            <div>{user.displayName}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matches Played</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={matchesPlayed} />
        </CardContent>
      </Card>
    </div>
  );
}

export async function loader({ params }: { params: { userId: string } }) {
  const userId = params.userId;

  // Mock data for now
  const user = {
    id: userId,
    name: "John Doe",
    displayName: "JDoe",
  };

  const matchesPlayed: UserMatch[] = [
    { id: "1", matchNumber: 101, points: 85 },
    { id: "2", matchNumber: 102, points: 92 },
    { id: "3", matchNumber: 105, points: 78 },
  ];

  return { user, matchesPlayed };
}
```

---

_**User**_

Looks good, let's update loader data in @users.tsx to pull data from actual db. 

Use @schema.prisma  for reference.

---

_**Assistant**_

Let's update the users.tsx loader to fetch real data from the database:

```typescript:app/routes/users.tsx
import { UserListCard } from "~/components/user/userlistcard";
import { db } from "~/utils/db.server";

export default function Users() {
  return (
    <div className="container py-4 space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <UserListCard />
    </div>
  );
}

export async function loader() {
  // Fetch real users from the database
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      displayName: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return { users };
}
```

Now let's do the same for the user.tsx route to fetch actual user data and their matches:

```typescript:app/routes/user.tsx
import { useLoaderData } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DataTable } from "~/components/user/matches-data-table";
import { columns } from "~/components/user/matches-columns";
import type { UserMatch } from "~/components/user/matches-columns";
import { db } from "~/utils/db.server";

export default function UserDetails() {
  const { user, matchesPlayed } = useLoaderData<typeof loader>();

  return (
    <div className="container py-4 space-y-4">
      <h1 className="text-2xl font-bold">User Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Display Name:</div>
            <div>{user.displayName}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matches Played</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={matchesPlayed} />
        </CardContent>
      </Card>
    </div>
  );
}

export async function loader({ params }: { params: { userId: string } }) {
  const userId = params.userId;

  // Fetch the user from the database
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      displayName: true,
    },
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  // Fetch the matches played by the user
  const userScores = await db.userScore.findMany({
    where: { userId },
    select: {
      id: true,
      score: true,
      match: {
        select: {
          id: true,
          matchNumber: true,
        },
      },
    },
    orderBy: {
      match: {
        date: 'desc',
      },
    },
  });

  // Convert to the expected format
  const matchesPlayed: UserMatch[] = userScores.map((score) => ({
    id: score.match.id,
    matchNumber: parseInt(score.match.matchNumber),
    points: score.score,
  }));

  return { user, matchesPlayed };
}
```

Also, let's update the columns.tsx file to use the proper matchNumber format from schema:

```typescript:app/components/user/matches-columns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";

// This type represents the matches played by a user
export type UserMatch = {
  id: string;
  matchNumber: number;
  points: number;
};

export const columns: ColumnDef<UserMatch>[] = [
  {
    accessorKey: "matchNumber",
    header: "Match Number",
    cell: ({ row }) => {
      const matchId = row.original.id;
      const matchNumber = row.getValue("matchNumber");
      
      return (
        <Link 
          to={`/match/${matchId}`} 
          className="text-primary hover:underline"
        >
          {matchNumber}
        </Link>
      );
    },
  },
  {
    accessorKey: "points",
    header: "Points",
  },
];
```

---

_**User**_

On @user.tsx , lets' update the loader to order the users by matchNumber. 

---

_**Assistant**_

Let's update the loader in user.tsx to order the userScores by matchNumber:

```typescript:app/routes/user.tsx
export async function loader({ params }: { params: { userId: string } }) {
  const userId = params.userId;

  // Fetch the user from the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      displayName: true,
    },
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  // Fetch the matches played by the user
  const userScores = await prisma.userScore.findMany({
    where: { userId },
    select: {
      id: true,
      score: true,
      match: {
        select: {
          id: true,
          matchNumber: true,
        },
      },
    },
    orderBy: {
      match: {
        matchNumber: "desc", // Order by matchNumber instead of date
      },
    },
  });

  // Convert to the expected format
  const matchesPlayed: UserMatch[] = userScores.map((score) => ({
    id: score.match.id,
    matchNumber: parseInt(score.match.matchNumber),
    points: score.score,
  }));

  return { user, matchesPlayed };
}
```

---

_**User**_

As `matchNumber` in DB is a string, it's not ordering as expected, Can we order the data after fetching the results from DB? 

---

_**Assistant**_

You're right, since `matchNumber` is stored as a string in the database, the ordering might not work as expected. Let's modify the code to sort the results after fetching them:

```typescript:app/routes/user.tsx
export async function loader({ params }: { params: { userId: string } }) {
  const userId = params.userId;

  // Fetch the user from the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      displayName: true,
    },
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  // Fetch the matches played by the user
  const userScores = await prisma.userScore.findMany({
    where: { userId },
    select: {
      id: true,
      score: true,
      match: {
        select: {
          id: true,
          matchNumber: true,
        },
      },
    },
  });

  // Convert to the expected format and sort by matchNumber numerically
  const matchesPlayed: UserMatch[] = userScores
    .map((score) => ({
      id: score.match.id,
      matchNumber: parseInt(score.match.matchNumber),
      points: score.score,
    }))
    .sort((a, b) => b.matchNumber - a.matchNumber); // Sort in descending order

  return { user, matchesPlayed };
}
```

---



---

