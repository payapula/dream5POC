import { Link } from "react-router";
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
        <Link to={`/user/${userId}`} className="text-blue-600 hover:underline">
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
