import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "~/lib/utils";

export type UserResult = {
  id: string;
  name: string;
  score: number;
  rank: number;
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

export const columns: ColumnDef<UserResult>[] = [
  {
    accessorKey: "rank",
    header: () => <HeaderCell>Rank</HeaderCell>,
    cell: ({ row }) => (
      <Cell className="font-medium w-12">{row.getValue("rank")}</Cell>
    ),
  },
  {
    accessorKey: "name",
    header: () => <HeaderCell>Name</HeaderCell>,
    cell: ({ row }) => <Cell>{row.original.name}</Cell>,
  },
  {
    accessorKey: "score",
    header: () => <HeaderCell>Score</HeaderCell>,
    cell: ({ row }) => (
      <Cell className="text-right">{row.getValue("score")}</Cell>
    ),
  },
  {
    accessorKey: "oneUp",
    header: () => <HeaderCell>1Up</HeaderCell>,
    cell: ({ row }) => {
      const oneUp = row.getValue("oneUp") as number;
      return <Cell className="text-right">{oneUp > 0 ? oneUp : "-"}</Cell>;
    },
  },
  {
    accessorKey: "forOne",
    header: () => <HeaderCell>1st</HeaderCell>,
    cell: ({ row }) => {
      const forOne = row.original.forOne;
      return forOne > 0 ? (
        <Cell className="text-center text-red-500">+{forOne}</Cell>
      ) : (
        <Cell className="text-center ">-</Cell>
      );
    },
  },
];
