import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dream5 | Dashboard" }];
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  return <div>Dashboard</div>;
}
