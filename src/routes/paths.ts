export const ROUTES = {
  home: "/" as const,
  login: "/login" as const,
  signup: "/signup" as const,
  protectedHome: "/app" as const,
  pickMyOwn: "/app/pick-my-own" as const,
  drawForMe: "/app/draw-for-me" as const,
  // profile: "/app/profile" as const,
  // profileEdit: "/app/profile/edit" as const,
  // history: "/app/history" as const,
} satisfies Record<string, `/${string}` | "/">;
