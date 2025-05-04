import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { Link } from "react-router";

export type UserStats = {
  id: string;
  name: string;
  displayName: string;
  totalScore: number;
  matchesWon: number;
  matchesLost: number;
  ranking: number;
  oneUp: number;
  forOne: number;
};

function HeaderCell({ children }: { children: React.ReactNode }) {
  return <div className="text-left text-xs">{children}</div>;
}

function Cell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("text-left text-xs", className)}>{children}</div>;
}

export const columns: ColumnDef<UserStats>[] = [
  {
    accessorKey: "displayName",
    header: () => <HeaderCell>Name</HeaderCell>,
    cell: ({ row }) => {
      const displayName = row.original.displayName;
      const userId = row.original.id;

      return (
        <Link to={`/user/${userId}`} className="text-blue-600 hover:underline">
          {displayName}
        </Link>
      );
    },
  },
  {
    accessorKey: "ranking",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            return column.toggleSorting(column.getIsSorted() === "asc");
          }}
          className="text-xs pl-0 cursor-pointer"
        >
          Rank
        </Button>
      );
    },
    cell: ({ row }) => {
      const ranking = row.original.ranking;
      return <Cell className="text-center">{ranking}</Cell>;
    },
  },
  {
    accessorKey: "totalScore",
    header: () => <HeaderCell>Score</HeaderCell>,
    cell: ({ row }) => {
      const totalScore = row.original.totalScore;
      const formattedScore = totalScore.toLocaleString("en-IN");
      return <Cell className="text-center">{formattedScore}</Cell>;
    },
  },
  {
    accessorKey: "oneUp",
    header: () => <HeaderCell>1 Up</HeaderCell>,
    cell: ({ row }) => {
      const oneUp = row.original.oneUp;
      return <Cell className="text-center">{oneUp}</Cell>;
    },
  },
  {
    accessorKey: "forOne",
    header: () => <HeaderCell>For 1st</HeaderCell>,
    cell: ({ row }) => {
      const forOne = row.original.forOne;
      return forOne > 0 ? (
        <Cell className="text-center text-red-500">+{forOne}</Cell>
      ) : (
        <Cell className="text-center ">{forOne}</Cell>
      );
    },
  },
  {
    accessorKey: "matchesWon",
    header: () => <HeaderCell>Won</HeaderCell>,
    cell: ({ row }) => {
      const matchesWon = row.original.matchesWon;
      return <Cell className="text-center">{matchesWon}</Cell>;
    },
  },
  {
    accessorKey: "matchesLost",
    header: () => <HeaderCell>Lost</HeaderCell>,
    cell: ({ row }) => {
      const matchesLost = row.original.matchesLost;
      return <Cell className="text-center">{matchesLost}</Cell>;
    },
  },
];
