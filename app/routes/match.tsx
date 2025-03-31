import type { Route } from "./+types/match";

export default function Match({ loaderData, params }: Route.ComponentProps) {
  return (
    <div>
      Match {params.matchId}
      <pre>{JSON.stringify(loaderData, null, 2)}</pre>
    </div>
  );
}
