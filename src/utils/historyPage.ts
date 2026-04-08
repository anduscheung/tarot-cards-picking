export function modeLabel(mode: string) {
  const m = mode.toLowerCase();
  if (m.includes("pick")) return "Pick my own";
  if (m.includes("draw")) return "Draw for me";
  return mode;
}

export function modeKey(mode: string) {
  const m = mode.toLowerCase();
  if (m.includes("pick")) return "pick";
  if (m.includes("draw")) return "draw";
  return "all";
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
