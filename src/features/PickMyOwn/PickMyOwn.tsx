import { FC, useState, useEffect, useRef, DragEvent } from "react";
import { useLocation, useNavigate, useOutletContext, Navigate } from "react-router";
import styles from "./PickMyOwn.module.scss";
import backImg from "/src/assets/cardBack.png";
import { useTarotCards } from "../../hooks/useTarotCards";
import { imageUrlByIndex } from "../../utils/cardAssets";
import * as CONSTS from "../../utils/pickMyOwnPage";
import { createDraw } from "../../services";
import { LocationState } from "../../types/locationStates";
import { type CSSVars } from "../../types/pickMyOwnPage";
import { ROUTES } from "../../routes";
import { ProtectedLayoutContext } from "../../layouts/ProtectedLayout/ProtectedLayout";
import { usePickMyOwnGeometry } from "../../hooks/usePickMyOwnGeometry";
import { usePickMyOwnPhases } from "../../hooks/usePickMyOwnPhases";

const PickMyOwn: FC = () => {
  const { data: cards, error } = useTarotCards();
  const { state } = useLocation() as { state: LocationState | null };
  const question = state?.question ?? "";
  const navigate = useNavigate();
  const { setShowReadingTopBar } = useOutletContext<ProtectedLayoutContext>();
  const geo = usePickMyOwnGeometry();

  /** Selected + flipped */
  const [drawn, setDrawn] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  /** Drag & drop slots (exactly 3) */
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null]);
  const [overSlot, setOverSlot] = useState<number | null>(null);

  /** Drawer state */
  const autoOpenDoneRef = useRef(false);
  const autoFlipDoneRef = useRef(false);
  const [detailSlot, setDetailSlot] = useState<number | null>(null);
  const closeDetail = () => setDetailSlot(null);

  const threeSelected = slots.every((s) => s != null);
  const allFlipped = threeSelected && slots.every((s) => s != null && flipped.has(s!));
  const savedOnceRef = useRef(false);
  const [createDrawError, setCreateDrawError] = useState<string | null>(null);

  // show top bar once all flipped
  useEffect(() => {
    setShowReadingTopBar(allFlipped);
    return () => setShowReadingTopBar(false);
  }, [allFlipped, setShowReadingTopBar]);

  // Auto-open drawer once all flipped
  useEffect(() => {
    if (!cards || !allFlipped || autoOpenDoneRef.current || savedOnceRef.current) return;
    setDetailSlot(0);
    autoOpenDoneRef.current = true;
    savedOnceRef.current = true;

    (async () => {
      try {
        setCreateDrawError(null);
        await createDraw({
          mode: "pick-my-own",
          question,
          cards: (slots as [number, number, number]).map((num, idx) => ({
            name: cards[num].name,
            reversed: false,
            position: idx + 1,
          })),
        });
      } catch {
        // if it failed, allow retry by flipping flag back
        savedOnceRef.current = false;
        setCreateDrawError("Failed to save this reading. Please report to admin.");
      }
    })();
  }, [slots, question, cards, allFlipped]);

  // Close drawer on ESC
  useEffect(() => {
    if (detailSlot === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDetail();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailSlot]);

  const resetForNewRun = () => {
    setDrawn([]);
    setSlots([null, null, null]);
    setFlipped(new Set());
    setDetailSlot(null);
    setCreateDrawError(null);
    autoOpenDoneRef.current = false;
    autoFlipDoneRef.current = false;
    savedOnceRef.current = false;
  };

  const { phase, cutA, cutB, startShuffle } = usePickMyOwnPhases(resetForNewRun);

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
  const onDragStartCard = (e: DragEvent, idx: number) => {
    if (phase !== "spread") return;
    if (drawn.includes(idx)) return; // already selected
    e.dataTransfer.setData("text/plain", String(idx));
    e.dataTransfer.effectAllowed = "copy";
  };

  const selectCardIntoSlot = (slotIndex: number, cardIndex: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = cardIndex;
      return next;
    });
    setDrawn((d) => [...d, cardIndex]);
  };

  const onDropToSlot = (slotIndex: number, e: DragEvent) => {
    e.preventDefault();
    setOverSlot(null);

    if (phase !== "spread") return;

    if (slotIndex !== nextSlotIndex || slots[slotIndex] != null) {
      return;
    }

    const raw = e.dataTransfer.getData("text/plain");
    const idx = Number(raw);

    if (Number.isNaN(idx)) return;
    if (drawn.includes(idx)) return;
    if (drawn.length >= 3) return;

    selectCardIntoSlot(slotIndex, idx);
  };

  const onDragOverSlot = (slotIndex: number, e: DragEvent) => {
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

  const onTrayCardClick = (slotIdx: number, cardIdx: number) => {
    if (!threeSelected) {
      return;
    }
    if (!flipped.has(cardIdx)) {
      setFlipped((s) => new Set(s).add(cardIdx));
      return;
    }

    setDetailSlot(slotIdx);
  };

  /** Fallback: click to pick (fills ONLY the next slot) */
  const onCardClick = (idx: number) => {
    if (phase !== "spread") return;
    if (drawn.length >= 3) return;
    if (drawn.includes(idx)) return;

    if (slots[nextSlotIndex] != null) return;

    selectCardIntoSlot(nextSlotIndex, idx);
  };

  /** Per-index helpers */
  const mid = Math.floor(CONSTS.COUNT / 2);
  const isPickFull = drawn.length >= 3;

  if (!question) return <Navigate to={ROUTES.protectedHome} replace />;
  if (error || !cards) return <p style={{ color: "red" }}>Failed to load cards.</p>;

  return (
    <div className={styles.container} style={geo.rootVars}>
      {phase !== "spread" && <h5 className={styles.hint}>Focus on your question</h5>}

      {/* Fan stage with phase class */}
      <div
        className={[styles.fan, styles[phase], isPickFull ? styles.isPickFull : ""].join(" ")}
        style={geo.fanVars}
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

          {geo.backs.map((src, i) => {
            const t = CONSTS.COUNT > 1 ? i / (CONSTS.COUNT - 1) : 0.5;
            const angle = -geo.totalAngleDeg / 2 + geo.totalAngleDeg * t;

            // For weave: split by half; cluster (1..3) rhythm
            const pile = i < mid ? 0 : 1;
            const weaveCluster = (i % 3) + 1;

            // For triple: assign left/mid/right based on cutA/cutB
            const a = cutA ?? mid - Math.floor(CONSTS.COUNT * 0.18);
            const b = cutB ?? mid + Math.floor(CONSTS.COUNT * 0.18);
            const tri = i < a ? 0 : i < b ? 1 : 2; // 0=left,1=mid,2=right

            const vars: CSSVars = {
              "--angle": `${angle}deg`,
              "--delay": `${i * CONSTS.STAGGER_MS}ms`,
              "--sweep": `${geo.sweepDelays[i]}ms`,
              "--cx": `${geo.chaos[i].dx}px`,
              "--cy": `${geo.chaos[i].dy}px`,
              "--crot": `${geo.chaos[i].rot}deg`,
              "--cdelay": `${geo.chaos[i].delay}ms`,
              "--cdur": `${geo.chaos[i].dur}ms`,
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
            const isTopCardAttention = phase === "idle" && i === CONSTS.COUNT - 1;

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
                    ].join(" ")}
                    onDragOver={(e) => onDragOverSlot(slotIdx, e)}
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
                        onClick={() => onTrayCardClick(slotIdx, cardIdx!)}
                        aria-label={`Reveal or open details for slot ${slotIdx + 1}`}
                      >
                        <div className={styles.trayInner}>
                          <div
                            className={styles.back}
                            style={{ backgroundImage: `url(${backImg})` }}
                          />
                          <div
                            className={styles.front}
                            style={{ backgroundImage: `url(${imageUrlByIndex(cardIdx!)})` }}
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
          {allFlipped && (
            <button
              className={styles.nextQuestion}
              onClick={() => navigate(ROUTES.protectedHome, { replace: true })}
            >
              Ask the next question?
            </button>
          )}
          {createDrawError && <div className={styles.saveError}>{createDrawError}</div>}

          {detailSlot !== null &&
            (() => {
              const cardIdx = slots[detailSlot]!;
              const card = cards[cardIdx];

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
                      <img src={imageUrlByIndex(cardIdx)} alt={card?.name ?? `card ${cardIdx}`} />
                    </div>

                    <div className={styles.detailsBody}>
                      <h3 className={styles.detailsTitle}>{card?.name ?? `#${cardIdx}`}</h3>
                      {card?.meaning_up && (
                        <p className={styles.detailsMeaning}>{card.meaning_up}</p>
                      )}
                    </div>
                  </aside>
                </>
              );
            })()}
        </>
      )}
    </div>
  );
};

export default PickMyOwn;
