import type { ColumnDef } from "@tanstack/react-table";

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
    cell: ({ row }) => (
      <div className="font-medium w-12">{row.getValue("rank")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("score")}</div>
    ),
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
