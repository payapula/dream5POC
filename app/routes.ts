import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("matches", "routes/matches.tsx"),
  route("match/:matchId", "routes/match.tsx"),

  /**
   * Resource Routes
   */
  route("match-list", "routes/match-list.ts"),
] satisfies RouteConfig;
