import React, { useMemo, useState, useEffect, useRef } from "react";
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
const COUNT = 78;
const TARGET_ARC_DEG = 140;
const BASELINE_PAD = 24;
const STAGGER_MS = 10;

/** Animation timings */
const CHAOS_MS = 1200; // free shuffle
const WEAVE_PASSES_MIN = 3;
const WEAVE_PASSES_MAX = 5;
const WEAVE_MS = 1800;
const TRIPLE_MS = 2600;
const STACK_MS = 520;
const AUTO_SPREAD_DELAY = 800;

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

  /** Selected + flipped */
  const [drawn, setDrawn] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  /** Drag & drop slots (exactly 3) */
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null]);
  const [overSlot, setOverSlot] = useState<number | null>(null);
  const [shakeSlot, setShakeSlot] = useState<number | null>(null);

  /** Viewport */
  const [vw, setVw] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [vh, setVh] = useState<number>(typeof window !== "undefined" ? window.innerHeight : 800);

  /** Drawer state */
  const autoOpenDoneRef = useRef(false);
  const autoFlipDoneRef = useRef(false);
  const [detailSlot, setDetailSlot] = useState<number | null>(null);
  const openDetail = (slot: number) => setDetailSlot(slot);
  const closeDetail = () => setDetailSlot(null);

  const threeSelected = slots.every((s) => s != null);

  // Auto-open drawer once all flipped
  useEffect(() => {
    const allFlipped = threeSelected && slots.every((s) => s != null && flipped.has(s!));
    if (allFlipped && !autoOpenDoneRef.current) {
      setDetailSlot(0);
      autoOpenDoneRef.current = true;
    }
  }, [slots, flipped, threeSelected]);

  // Close drawer on ESC
  useEffect(() => {
    if (detailSlot === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDetail();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailSlot]);

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

  /** Start: idle → shuffle → weave → triple → stack → spread */
  const startShuffle = () => {
    if (phase !== "idle") return;
    setDrawn([]);
    setSlots([null, null, null]);
    setFlipped(new Set());
    setDetailSlot(null);
    autoOpenDoneRef.current = false;
    autoFlipDoneRef.current = false;

    const passes =
      Math.floor(Math.random() * (WEAVE_PASSES_MAX - WEAVE_PASSES_MIN + 1)) + WEAVE_PASSES_MIN;

    setPhase("shuffle");

    window.setTimeout(() => {
      setPhase("weave");
      let pass = 1;

      const runNext = () => {
        if (pass >= passes) {
          const a = centeredCutIndex(COUNT, 0.24);
          let b = centeredCutIndex(COUNT, 0.24);
          if (a === b) b = Math.min(COUNT - 1, a + 1);
          const [c1, c2] = a < b ? [a, b] : [b, a];
          setCutA(c1);
          setCutB(c2);

          setPhase("triple");
          window.setTimeout(() => {
            setPhase("stack");
            window.setTimeout(() => setPhase("spread"), STACK_MS + AUTO_SPREAD_DELAY);
          }, TRIPLE_MS);
          return;
        }
        pass += 1;
        window.setTimeout(runNext, WEAVE_MS);
      };

      window.setTimeout(runNext, WEAVE_MS);
    }, CHAOS_MS);
  };

  /** Auto-flip sequence after 3 are picked (0.5s delay, staggered) */
  useEffect(() => {
    if (!threeSelected || autoFlipDoneRef.current) return;
    const [a, b, c] = slots as [number, number, number];

    const t0 = setTimeout(() => setFlipped((s) => new Set(s).add(a)), 500);
    const t1 = setTimeout(() => setFlipped((s) => new Set(s).add(b)), 500 + 220);
    const t2 = setTimeout(() => setFlipped((s) => new Set(s).add(c)), 500 + 440);

    autoFlipDoneRef.current = true;

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [threeSelected, slots]);

  /** Sequence control */
  const labels = ["past", "now", "future"] as const;
  const nextSlotIndex = drawn.length; // 0=past, 1=now, 2=future
  const nextLabel = labels[nextSlotIndex] ?? null;

  /** Drag helpers */
  const onDragStartCard = (e: React.DragEvent, idx: number) => {
    if (phase !== "spread") return;
    if (drawn.includes(idx)) return; // already selected
    e.dataTransfer.setData("text/plain", String(idx));
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDropToSlot = (slotIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    setOverSlot(null);
    if (phase !== "spread") return;

    if (slotIndex !== nextSlotIndex || slots[slotIndex] != null) {
      setShakeSlot(slotIndex);
      window.setTimeout(() => setShakeSlot(null), 260);
      return;
    }

    const raw = e.dataTransfer.getData("text/plain");
    const idx = Number(raw);
    if (Number.isNaN(idx)) return;
    if (drawn.includes(idx)) return;
    if (drawn.length >= 3) return;

    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = idx;
      return next;
    });
    setDrawn((d) => [...d, idx]);
  };

  const onDragOverSlot = (slotIndex: number, e: React.DragEvent) => {
    if (phase !== "spread") return;
    // Only the next slot (and empty) is droppable
    if (slotIndex !== nextSlotIndex || slots[slotIndex] != null) {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (overSlot !== slotIndex) setOverSlot(slotIndex);
  };

  const onDragLeaveSlot = (slotIndex: number) => {
    if (overSlot === slotIndex) setOverSlot(null);
  };

  /** Fallback: click to pick (fills ONLY the next slot) */
  const onCardClick = (idx: number) => {
    if (phase !== "spread") return;
    if (drawn.length >= 3) return;
    if (drawn.includes(idx)) return;

    if (slots[nextSlotIndex] != null) return;
    setSlots((prev) => {
      const next = [...prev];
      next[nextSlotIndex] = idx;
      return next;
    });
    setDrawn((d) => [...d, idx]);
  };

  /** Root & stage CSS vars */
  const leftAngleDeg = -totalAngleDeg / 2;
  const rootVars: CSSVars = {
    "--card-w": `${cardW}px`,
    "--card-h": `${cardH}px`,
  };
  const fanVars: CSSVars = {
    "--pivot": `${R}px`,
    "--fan-h": `${cardH + (R - R * Math.cos(thetaRad / 2)) + 80}px`,
    "--weave-dur": `${WEAVE_MS}ms`,
    "--triple-dur": `${TRIPLE_MS}ms`,
    "--left-angle": `${leftAngleDeg}deg`,
  };

  /** Per-index helpers */
  const mid = Math.floor(COUNT / 2);
  const isPickFull = drawn.length >= 3;

  return (
    <div className={styles.container} style={rootVars}>
      {phase !== "spread" && <h5 className={styles.hint}>Focus on your question</h5>}

      {/* Fan stage with phase class */}
      <div
        className={[styles.fan, styles[phase], isPickFull ? styles.isPickFull : ""].join(" ")}
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
                  draggable={phase === "spread" && !picked && drawn.length < 3}
                  onDragStart={(e) => onDragStartCard(e, i)}
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
                  aria-grabbed={phase === "spread" && !picked ? "true" : undefined}
                >
                  <img src={src} alt={`Tarot card back ${i + 1}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======= Drop area under spread (sequence enforced) ======= */}
      {phase === "spread" && (
        <>
          <div className={styles.dropWrap} aria-label="Drop area for your 3 cards">
            <div className={styles.dropHint}>
              Drag 3 cards —{" "}
              <span className={styles.step}>
                {nextLabel ? `Next: ${nextLabel.toUpperCase()}` : "All set"}
              </span>
            </div>
            <div className={styles.dropRow}>
              {[0, 1, 2].map((slotIdx) => {
                const cardIdx = slots[slotIdx];
                const filled = cardIdx != null;
                const flipOn = filled ? flipped.has(cardIdx!) : false;
                const isNext = slotIdx === nextSlotIndex && !filled;

                return (
                  <div
                    key={slotIdx}
                    className={[
                      styles.dropSlot,
                      filled ? styles.filled : "",
                      overSlot === slotIdx ? styles.over : "",
                      isNext ? styles.next : styles.blocked,
                      shakeSlot === slotIdx ? styles.reject : "",
                    ].join(" ")}
                    onDragOver={(e) => onDragOverSlot(slotIdx, e)}
                    onDragEnter={() => {
                      if (slotIdx === nextSlotIndex && !slots[slotIdx]) setOverSlot(slotIdx);
                    }}
                    onDragLeave={() => onDragLeaveSlot(slotIdx)}
                    onDrop={(e) => onDropToSlot(slotIdx, e)}
                    role="region"
                    aria-label={`Drop zone ${slotIdx + 1} (${["past", "now", "future"][slotIdx]})`}
                    aria-disabled={slotIdx !== nextSlotIndex || !!slots[slotIdx]}
                  >
                    {filled ? (
                      <button
                        type="button"
                        className={`${styles.trayCard} ${flipOn ? styles.flipped : ""}`}
                        onClick={() => {
                          if (!threeSelected) {
                            setShakeSlot(slotIdx);
                            window.setTimeout(() => setShakeSlot(null), 260);
                            return;
                          }
                          if (!flipOn) {
                            setFlipped((s) => new Set(s).add(cardIdx!));
                          } else {
                            openDetail(slotIdx);
                          }
                        }}
                        aria-label={`Reveal or open details for slot ${slotIdx + 1}`}
                      >
                        <div className={styles.trayInner}>
                          <div
                            className={styles.back}
                            style={{ backgroundImage: `url(${backImg})` }}
                          />
                          <div
                            className={styles.front}
                            style={{ backgroundImage: `url(${FACE_IMAGES[cardIdx!]})` }}
                            aria-hidden={!flipOn}
                          />
                        </div>
                      </button>
                    ) : (
                      <span className={styles.dropLabel}>
                        {slotIdx === 0 ? "past" : slotIdx === 1 ? "now" : "future"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {detailSlot !== null &&
            (() => {
              const cardIdx = slots[detailSlot]!;
              const meaning = CARD_MEANINGS[cardIdx];

              return (
                <>
                  <div className={styles.detailsScrim} onClick={closeDetail} />
                  <aside
                    className={`${styles.detailsPanel} ${styles.open}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Card details"
                  >
                    <header className={styles.detailsHeader}>
                      <div className={styles.detailsTabs}>
                        {["past", "now", "future"].map((lbl, i) => {
                          const enabled = slots[i] != null;
                          return (
                            <button
                              key={lbl}
                              type="button"
                              className={[
                                styles.detailsTab,
                                i === detailSlot ? styles.active : "",
                              ].join(" ")}
                              onClick={() => enabled && setDetailSlot(i)}
                              disabled={!enabled}
                            >
                              {lbl}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        className={styles.detailsClose}
                        onClick={closeDetail}
                        aria-label="Close"
                      >
                        ✕
                      </button>
                    </header>

                    <div className={styles.detailsHero}>
                      <img src={FACE_IMAGES[cardIdx]} alt={meaning?.name ?? `card ${cardIdx}`} />
                    </div>

                    <div className={styles.detailsBody}>
                      <h3 className={styles.detailsTitle}>{meaning?.name ?? `#${cardIdx}`}</h3>
                      {meaning?.meaning_up && (
                        <p className={styles.detailsMeaning}>{meaning.meaning_up}</p>
                      )}
                      {meaning?.desc && <p className={styles.detailsDesc}>{meaning.desc}</p>}
                    </div>
                  </aside>
                </>
              );
            })()}
        </>
      )}
    </div>
  );
}
