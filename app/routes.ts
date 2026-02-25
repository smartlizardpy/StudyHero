import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("daily", "routes/daily.tsx"),
  route("quiz", "routes/quiz.tsx"),
  route("review", "routes/review.tsx"),
  route("drill", "routes/drill.tsx"),
  route("results", "routes/results.tsx"),
  route("analytics", "routes/analytics.tsx"),
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig;
