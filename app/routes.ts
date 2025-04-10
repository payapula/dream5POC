import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("matches", "routes/matches.tsx"),
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
