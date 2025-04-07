import { UserListCard } from "~/components/user/userlistcard";
import { prisma } from "~/utils/db.server";

export default function Users() {
  return (
    <div className="container py-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">Users</h1>
      <UserListCard />
    </div>
  );
}

export async function loader() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      displayName: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return { users };
}
