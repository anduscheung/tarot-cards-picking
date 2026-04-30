import { useEffect, useMemo, useState } from "react";
import backImg from "/src/assets/cardBack.png";
import * as CONSTS from "../utils/pickMyOwnPage";
import type { CSSVars } from "../types/pickMyOwnPage";

export function usePickMyOwnGeometry() {
  /** Viewport */
  const [vw, setVw] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [vh, setVh] = useState<number>(typeof window !== "undefined" ? window.innerHeight : 800);

  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /** Deck (just for count/back image) */
  const backs = useMemo(() => Array.from({ length: CONSTS.COUNT }, () => backImg), []);

  /** Fan geometry (centered, responsive) */
  let thetaRad = (CONSTS.TARGET_ARC_DEG * Math.PI) / 180;
  const chord = vw * 0.7;
  let R = chord / (2 * Math.sin(thetaRad / 2));
  const sagitta = R - R * Math.cos(thetaRad / 2);
  const maxSagitta = Math.max(80, vh - CONSTS.BASELINE_PAD - 180 - 40);

  if (sagitta > maxSagitta) {
    const cosHalf = 1 - maxSagitta / R;
    thetaRad = 2 * Math.acos(Math.max(-1, Math.min(1, cosHalf)));
    R = chord / (2 * Math.sin(thetaRad / 2));
  }

  const totalAngleDeg = (thetaRad * 180) / Math.PI;

  /** Card size: scale to fit */
  const maxWByWidth = chord / 20;
  const maxWByHeight = (vh - CONSTS.BASELINE_PAD - (R - R * Math.cos(thetaRad / 2)) - 80) * (2 / 3);
  const cardW = Math.max(76, Math.min(120, Math.min(maxWByWidth, maxWByHeight)));
  const cardH = (cardW / 2) * 3;

  /** Root & stage CSS vars */
  const rootVars: CSSVars = {
    "--card-w": `${cardW}px`,
    "--card-h": `${cardH}px`,
  };

  const fanVars: CSSVars = {
    "--pivot": `${R}px`,
    "--fan-h": `${cardH + (R - R * Math.cos(thetaRad / 2)) + 80}px`,
    "--weave-dur": `${CONSTS.WEAVE_MS}ms`,
    "--triple-dur": `${CONSTS.TRIPLE_MS}ms`,
    "--left-angle": `${-totalAngleDeg / 2}deg`,
  };

  /** Per-card chaos (for shuffle) */
  const chaos = useMemo(
    () =>
      backs.map(() => {
        const dx = (Math.random() * 2 - 1) * Math.min(160, vw * 0.18);
        const dy = (Math.random() * 2 - 1) * Math.min(90, vh * 0.12);
        const rot = (Math.random() * 2 - 1) * 42;
        const delay = Math.floor(Math.random() * 220);
        const dur = Math.max(520, CONSTS.CHAOS_MS - delay - Math.random() * 200);
        return { dx, dy, rot, delay, dur };
      }),
    [backs, vh, vw],
  );

  /** Sweep delays for nice spread */
  const sweepDelays = useMemo(
    () =>
      backs.map((_, i) => {
        const t = CONSTS.COUNT > 1 ? i / (CONSTS.COUNT - 1) : 0.5;
        return Math.round(240 * t);
      }),
    [backs],
  );

  return {
    backs,
    chord,
    totalAngleDeg,
    rootVars,
    fanVars,
    chaos,
    sweepDelays,
  };
}
