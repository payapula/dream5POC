import {
  type RouteConfig,
  index,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),

  /**
   * Matches
   */
  route("matches", "routes/matches/matchesRoot.tsx", [
    index("routes/matches/index.tsx"),
    route("chart", "routes/matches/chart.tsx"),
  ]),
  route("match/:matchId", "routes/match.tsx"),

  /**
   * Users
   */
  route("users", "routes/users.tsx"),
  route("user/:userId", "routes/user.tsx"),

  /**
   * Resource Routes
   */
  route("match-list", "routes/match-list.ts"),
  route("played-matches/:matchId", "routes/played-matches.ts"),
] satisfies RouteConfig;
