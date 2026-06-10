export const ROUTES = {
  home: "/" as const,
  login: "/login" as const,
  signup: "/signup" as const,
  demo: "/demo" as const,
  demoPickMyOwn: "/demo/pick-my-own" as const,
  demoDrawForMe: "/demo/draw-for-me" as const,
  protectedHome: "/app" as const,
  pickMyOwn: "/app/pick-my-own" as const,
  drawForMe: "/app/draw-for-me" as const,
  history: "/app/history" as const,
} satisfies Record<string, `/${string}` | "/">;
