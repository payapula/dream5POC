import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dream 5 Application" },
    { name: "description", content: "Welcome to Dream 5 Application!" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: "Hello from Dream 5 Application" };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} />;
}
