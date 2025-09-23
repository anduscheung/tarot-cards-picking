import React, { useMemo, useState, useEffect } from "react";
import styles from "./PickMyOwn.module.scss";
import backImg from "/src/assets/cardBack.png";
import { CARD_MEANINGS } from "../../constants/card.constants";

/** Load /src/assets/cards/0.png..77.png -> FACE_IMAGES[index] */
const PRE_IMAGES = import.meta.glob("/src/assets/cards/*.png", { eager: true }) as Record<
  string,
  { default: string }
>;
const FACE_IMAGES: Record<number, string> = Object.fromEntries(
  Object.entries(PRE_IMAGES)
    .map(([path, mod]) => {
      const m = path.match(/(\d+)\.png$/);
      if (!m) return null;
      return [Number(m[1]), mod.default] as const;
    })
    .filter(Boolean) as [number, string][]
);

/** CSS variables helper type (no `any`) */
type CSSVars = React.CSSProperties & { [k in `--${string}`]?: string };

type Phase = "idle" | "shuffle" | "weave" | "triple" | "stack" | "spread";

/** Tunables */
const COUNT: number = 78;
const TARGET_ARC_DEG = 140;
const BASELINE_PAD = 24;
const STAGGER_MS = 10;

/** Animation timings */
const CHAOS_MS = 1200; // free shuffle
const WEAVE_PASSES_MIN = 3; // 3–5 passes
const WEAVE_PASSES_MAX = 5;
const WEAVE_MS = 1800; // each pass length
const TRIPLE_MS = 2600; // longer triple so it reads clearly
const STACK_MS = 520;
const AUTO_SPREAD_DELAY = 800; // small pause before spreading

/** Center-biased cut (normal-like distribution) */
function centeredCutIndex(n: number, spread = 0.2): number {
  const u = Math.max(1e-6, Math.random());
  const v = Math.max(1e-6, Math.random());
  let z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  z = Math.max(-1, Math.min(1, z));
  const frac = 0.5 + z * spread;
  const idx = Math.round(frac * n);
  return Math.min(n - 1, Math.max(1, idx));
}

export default function PickMyOwn() {
  /** Phases */
  const [phase, setPhase] = useState<Phase>("idle");
  const [open, setOpen] = useState(false);

  /** Selected + flipped */
  const [drawn, setDrawn] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

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
  const backs = useMemo(() => Array.from({ length: COUNT }, () => backImg), []);

  /** Fan geometry (centered, responsive) */
  let thetaRad = (TARGET_ARC_DEG * Math.PI) / 180;
  const chord = vw * 0.7;
  let R = chord / (2 * Math.sin(thetaRad / 2));
  const sagitta = R - R * Math.cos(thetaRad / 2);
  const maxSagitta = Math.max(80, vh - BASELINE_PAD - 180 - 40);
  if (sagitta > maxSagitta) {
    const cosHalf = 1 - maxSagitta / R;
    thetaRad = 2 * Math.acos(Math.max(-1, Math.min(1, cosHalf)));
    R = chord / (2 * Math.sin(thetaRad / 2));
  }
  const totalAngleDeg = (thetaRad * 180) / Math.PI;

  /** Card size: scale to fit */
  const maxWByWidth = chord / 20;
  const maxWByHeight = (vh - BASELINE_PAD - (R - R * Math.cos(thetaRad / 2)) - 80) * (2 / 3);
  const cardW = Math.max(76, Math.min(120, Math.min(maxWByWidth, maxWByHeight)));
  const cardH = (cardW / 2) * 3;

  /** Per-card chaos (for shuffle) */
  const chaos = useMemo(
    () =>
      backs.map(() => {
        const dx = (Math.random() * 2 - 1) * Math.min(160, vw * 0.18);
        const dy = (Math.random() * 2 - 1) * Math.min(90, vh * 0.12);
        const rot = (Math.random() * 2 - 1) * 42;
        const delay = Math.floor(Math.random() * 220);
        const dur = Math.max(520, CHAOS_MS - delay - Math.random() * 200);
        return { dx, dy, rot, delay, dur };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vw, vh]
  );

  /** Sweep delays for nice spread */
  const sweepDelays = useMemo(
    () =>
      backs.map((_, i) => {
        const t = COUNT > 1 ? i / (COUNT - 1) : 0.5;
        return Math.round(240 * t);
      }),
    []
  );

  /** Triple cut indices (computed before triple) */
  const [cutA, setCutA] = useState<number | null>(null);
  const [cutB, setCutB] = useState<number | null>(null);

  /** Start: idle → shuffle → weave (N passes) → triple → stack → spread */
  const startShuffle = () => {
    if (phase !== "idle") return;
    setOpen(false);
    setDrawn([]);
    setFlipped(new Set());
    const passes =
      Math.floor(Math.random() * (WEAVE_PASSES_MAX - WEAVE_PASSES_MIN + 1)) + WEAVE_PASSES_MIN;

    setPhase("shuffle"); // free chaos in the center

    // chain weave passes sequentially with no gap to triple
    window.setTimeout(() => {
      setPhase("weave");
      let pass = 1;

      const runNext = () => {
        if (pass >= passes) {
          // prepare center-biased triple cuts, then go triple immediately (no visual pause)
          const a = centeredCutIndex(COUNT, 0.24);
          let b = centeredCutIndex(COUNT, 0.24);
          if (a === b) b = Math.min(COUNT - 1, a + 1);
          const [c1, c2] = a < b ? [a, b] : [b, a];
          setCutA(c1);
          setCutB(c2);

          setPhase("triple");
          // after triple animation, stack then spread
          window.setTimeout(() => {
            setPhase("stack");
            window.setTimeout(() => {
              setPhase("spread");
              setOpen(true);
            }, STACK_MS + AUTO_SPREAD_DELAY);
          }, TRIPLE_MS);
          return;
        }
        // schedule next weave pass
        pass += 1;
        window.setTimeout(runNext, WEAVE_MS);
      };

      // kick first pass timer
      window.setTimeout(runNext, WEAVE_MS);
    }, CHAOS_MS);
  };

  /** Pick a card (spread only) */
  const onCardClick = (idx: number) => {
    if (phase !== "spread" || !open) return;
    if (drawn.length >= 3) return;
    if (drawn.includes(idx)) return;
    setDrawn((d) => [...d, idx]);
  };

  /** Flip in tray */
  const onFlip = (idx: number) => {
    if (!drawn.includes(idx)) return;
    setFlipped((prev) => new Set(prev).add(idx));
  };

  /** Root & stage CSS vars */
  const rootVars: CSSVars = {
    "--card-w": `${cardW}px`,
    "--card-h": `${cardH}px`,
  };

  const leftAngleDeg = -totalAngleDeg / 2;
  const fanVars: CSSVars = {
    "--pivot": `${R}px`,
    "--fan-h": `${cardH + (R - R * Math.cos(thetaRad / 2)) + 80}px`,
    "--weave-dur": `${WEAVE_MS}ms`,
    "--triple-dur": `${TRIPLE_MS}ms`,
    "--left-angle": `${leftAngleDeg}deg`,
  };

  /** Per-index helpers */
  const mid = Math.floor(COUNT / 2);

  return (
    <div className={styles.container} style={rootVars}>
      {phase !== "spread" && <h5 className={styles.hint}>Focus on your question</h5>}
      {/* Fan stage with phase class */}
      <div
        className={`${styles.fan} ${open ? styles.isOpen : ""} ${styles[phase]}`}
        style={fanVars}
        role="list"
      >
        <div className={styles.anchor}>
          {/* Starter overlay: visible only while idle, sized to the deck footprint */}
          {phase === "idle" && (
            <button
              type="button"
              className={styles.starterOverlay}
              onClick={startShuffle}
              aria-label="Click the deck to start shuffling"
            >
              <span className={styles.starterHint}>Tap to shuffle</span>
            </button>
          )}

          {backs.map((src, i) => {
            const t = COUNT > 1 ? i / (COUNT - 1) : 0.5;
            const angle = -totalAngleDeg / 2 + totalAngleDeg * t;

            // For weave: split by half; cluster (1..3) rhythm
            const pile = i < mid ? 0 : 1;
            const weaveCluster = (i % 3) + 1;

            // For triple: assign left/mid/right based on cutA/cutB
            const a = cutA ?? mid - Math.floor(COUNT * 0.18);
            const b = cutB ?? mid + Math.floor(COUNT * 0.18);
            const tri = i < a ? 0 : i < b ? 1 : 2; // 0=left,1=mid,2=right

            const vars: CSSVars = {
              "--angle": `${angle}deg`,
              "--delay": `${i * STAGGER_MS}ms`,
              "--sweep": `${sweepDelays[i]}ms`,
              "--cx": `${chaos[i].dx}px`,
              "--cy": `${chaos[i].dy}px`,
              "--crot": `${chaos[i].rot}deg`,
              "--cdelay": `${chaos[i].delay}ms`,
              "--cdur": `${chaos[i].dur}ms`,
              "--pile": String(pile),
              "--weaveCluster": String(weaveCluster),
              "--tri": String(tri),
              "--isTri0": tri === 0 ? "1" : "0",
              "--isTri1": tri === 1 ? "1" : "0",
              "--isTri2": tri === 2 ? "1" : "0",
              "--stackJitter": `${(i % 7) * 2}px`,
              "--i": String(i),
            };

            const picked = drawn.includes(i);
            const isTopCardAttention = phase === "idle" && i === COUNT - 1;

            return (
              <div key={i} className={styles.slot}>
                <button
                  type="button"
                  className={[
                    styles.card,
                    picked ? styles.isPicked : "",
                    isTopCardAttention ? styles.attention : "",
                  ].join(" ")}
                  style={vars}
                  onClick={() => (phase === "spread" ? onCardClick(i) : undefined)}
                  aria-disabled={
                    phase === "spread" && !picked && drawn.length < 3 ? "false" : "true"
                  }
                >
                  <img src={src} alt={`Tarot card back ${i + 1}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.result}>
        {/* Tip while spread and not full */}
        {phase === "spread" && drawn.length < 3 && (
          <div className={styles.tip}>Pick 3 cards (selected {drawn.length}/3)</div>
        )}

        {/* Tray with 3D flip */}
        {drawn.length > 0 && (
          <div className={styles.trayWrap}>
            <div className={styles.tray}>
              {drawn.map((idx, k) => {
                const faceUrl = FACE_IMAGES[idx];
                const meaning = CARD_MEANINGS[idx];
                const flippedOn = flipped.has(idx);
                return (
                  <div key={idx} className={styles.trayItem}>
                    <div className={styles.badge}>
                      {k === 0 ? "past" : k === 1 ? "now" : "future"}
                    </div>
                    <button
                      type="button"
                      className={`${styles.trayCard} ${flippedOn ? styles.flipped : ""}`}
                      onClick={() => onFlip(idx)}
                      aria-label={`翻牌 ${k + 1}`}
                    >
                      <div className={styles.trayInner}>
                        <div className={styles.back}>
                          <img src={backImg} alt="back" className={styles.img} />
                        </div>
                        <div className={styles.front}>
                          <img
                            src={faceUrl}
                            alt={meaning?.name ?? `card ${idx}`}
                            className={styles.img}
                          />
                        </div>
                      </div>
                    </button>
                    <div className={styles.caption}>
                      {flippedOn ? (
                        <>
                          <div className={styles.cardName}>{meaning?.name ?? `#${idx}`}</div>
                          {meaning?.meaning_up && (
                            <p className={styles.meaning}>{meaning.meaning_up}</p>
                          )}
                          {meaning?.desc && <p className={styles.desc}>{meaning.desc}</p>}
                        </>
                      ) : (
                        <div className={styles.tapHint}>點擊卡背翻牌</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
