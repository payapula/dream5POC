import { useRouteLoaderData } from "react-router";
import type { loader as MatchesLoader } from "./matchesRoot";

export default function Chart() {
  const rootData = useRouteLoaderData<typeof MatchesLoader>(
    "routes/matches/matchesRoot"
  );

  if (!rootData) {
    return <div>No matches found</div>;
  }

  const { matches } = rootData;
  console.log("matches in chart", matches);

  return (
    <div>
      <h1>Chart example</h1>
    </div>
  );
}
