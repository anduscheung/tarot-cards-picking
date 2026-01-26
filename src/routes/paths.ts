export const ROUTES = {
  home: "/" as const,
  login: "/login" as const,
  signup: "/signup" as const,
  letMePick: "/let-me-pick" as const,
  drawForMe: "/draw-for-me" as const,
} satisfies Record<string, `/${string}` | "/">;
