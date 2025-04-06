import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";

export type Match = {
  id: string;
  number: string;
  details: string;
  winner: string;
  points: number;
  secondDiff: number;
};

export const columns: ColumnDef<Match>[] = [
  {
    accessorKey: "number",
    header: "Number",
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => {
      return (
        <Link
          to={`/matches/${row.original.id}`}
          className="text-blue-600 hover:underline"
        >
          {row.original.details}
        </Link>
      );
    },
  },
  {
    accessorKey: "winner",
    header: "Winner",
  },
  {
    accessorKey: "points",
    header: "Points",
  },
  {
    accessorKey: "secondDiff",
    header: "2nd Diff",
  },
];
