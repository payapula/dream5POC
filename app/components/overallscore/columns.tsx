import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { cn } from "~/lib/utils";

export type UserStats = {
  id: string;
  name: string;
  displayName: string;
  totalScore: number;
  matchesWon: number;
  matchesLost: number;
  ranking: number;
  oneUp: number;
};

export const mockData: UserStats[] = [
  {
    id: "4",
    name: "Bharathi Kannan",
    displayName: "BK Awesome Local",
    totalScore: 1011,
    matchesWon: 1,
    matchesLost: 0,
    ranking: 1,
    oneUp: 0,
  },
  {
    id: "2",
    name: "Naveen",
    displayName: "NKutty",
    totalScore: 884,
    matchesWon: 0,
    matchesLost: 0,
    ranking: 2,
    oneUp: 127,
  },
  {
    id: "1",
    name: "Karthik",
    displayName: "Assasino",
    totalScore: 866,
    matchesWon: 0,
    matchesLost: 0,
    ranking: 3,
    oneUp: 18,
  },
  {
    id: "5",
    name: "Balamurali",
    displayName: "Bala is Pakka",
    totalScore: 832,
    matchesWon: 0,
    matchesLost: 0,
    ranking: 4,
    oneUp: 34,
  },
  {
    id: "3",
    name: "Hari Prasad",
    displayName: "HP",
    totalScore: 768,
    matchesWon: 0,
    matchesLost: 1,
    ranking: 5,
    oneUp: 64,
  },
];

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
    header: () => <HeaderCell>User Name</HeaderCell>,
    cell: ({ row }) => {
      const displayName = row.original.displayName;
      return <Cell>{displayName}</Cell>;
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
          Ranking
          <ArrowUpDown className="ml-2" size={10} />
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
    header: () => <HeaderCell>Total Score</HeaderCell>,
    cell: ({ row }) => {
      const totalScore = row.original.totalScore;
      return <Cell>{totalScore}</Cell>;
    },
  },
  {
    accessorKey: "matchesWon",
    header: () => <HeaderCell>Matches Won</HeaderCell>,
    cell: ({ row }) => {
      const matchesWon = row.original.matchesWon;
      return <Cell className="text-center">{matchesWon}</Cell>;
    },
  },
  {
    accessorKey: "matchesLost",
    header: () => <HeaderCell>Matches Lost</HeaderCell>,
    cell: ({ row }) => {
      const matchesLost = row.original.matchesLost;
      return <Cell className="text-center">{matchesLost}</Cell>;
    },
  },
  {
    accessorKey: "oneUp",
    header: () => <HeaderCell>One Up</HeaderCell>,
    cell: ({ row }) => {
      const oneUp = row.original.oneUp;
      return <Cell className="text-center">{oneUp}</Cell>;
    },
  },
];
