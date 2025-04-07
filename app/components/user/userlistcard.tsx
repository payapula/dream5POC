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
