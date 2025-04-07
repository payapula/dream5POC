import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";

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
      const matchNumber = row.getValue("matchNumber") as number;

      return (
        <Link
          to={`/match/${matchId}`}
          className="text-blue-600 hover:underline"
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
