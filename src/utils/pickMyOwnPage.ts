/** Tunables */
export const COUNT = 78;
export const TARGET_ARC_DEG = 140;
export const BASELINE_PAD = 24;
export const STAGGER_MS = 10;

/** Animation timings */
export const CHAOS_MS = 1200; // free shuffle
export const WEAVE_PASSES_MIN = 3;
export const WEAVE_PASSES_MAX = 5;
export const WEAVE_MS = 1800;
export const TRIPLE_MS = 2600;
export const STACK_MS = 520;
export const AUTO_SPREAD_DELAY = 800;

/** Center-biased cut (normal-like distribution) */
export function centeredCutIndex(n: number, spread = 0.2): number {
  const u = Math.max(1e-6, Math.random());
  const v = Math.max(1e-6, Math.random());
  let z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  z = Math.max(-1, Math.min(1, z));
  const frac = 0.5 + z * spread;
  const idx = Math.round(frac * n);
  return Math.min(n - 1, Math.max(1, idx));
}
