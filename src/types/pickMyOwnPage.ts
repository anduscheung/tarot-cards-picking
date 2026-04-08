/** CSS variables helper type (no `any`) */
export type CSSVars = React.CSSProperties & { [k in `--${string}`]?: string };

export type Phase = "idle" | "shuffle" | "weave" | "triple" | "stack" | "spread";
