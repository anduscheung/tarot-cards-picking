import { useEffect, useRef, useState } from "react";
import * as CONSTS from "../utils/pickMyOwnPage";
import { centeredCutIndex } from "../utils/pickMyOwnPage";
import type { Phase } from "../types/pickMyOwnPage";

export function usePickMyOwnPhases(onBeforeStart: () => void) {
  const [phase, setPhase] = useState<Phase>("idle");

  /** Triple cut indices (computed before triple) */
  const [cutA, setCutA] = useState<number | null>(null);
  const [cutB, setCutB] = useState<number | null>(null);

  const timersRef = useRef<number[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const queueTimeout = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  };

  /** Start: idle → shuffle → weave → triple → stack → spread */
  const startShuffle = () => {
    if (phase !== "idle") return;

    onBeforeStart();
    clearAllTimers();

    const passes =
      Math.floor(Math.random() * (CONSTS.WEAVE_PASSES_MAX - CONSTS.WEAVE_PASSES_MIN + 1)) +
      CONSTS.WEAVE_PASSES_MIN;

    setCutA(null);
    setCutB(null);
    setPhase("shuffle");

    queueTimeout(() => {
      setPhase("weave");
      let pass = 1;

      const runNext = () => {
        if (pass >= passes) {
          const a = centeredCutIndex(CONSTS.COUNT, 0.24);
          let b = centeredCutIndex(CONSTS.COUNT, 0.24);

          if (a === b) b = Math.min(CONSTS.COUNT - 1, a + 1);

          const [c1, c2] = a < b ? [a, b] : [b, a];
          setCutA(c1);
          setCutB(c2);

          setPhase("triple");

          queueTimeout(() => {
            setPhase("stack");

            queueTimeout(() => {
              setPhase("spread");
            }, CONSTS.STACK_MS + CONSTS.AUTO_SPREAD_DELAY);
          }, CONSTS.TRIPLE_MS);

          return;
        }

        pass += 1;
        queueTimeout(runNext, CONSTS.WEAVE_MS);
      };

      queueTimeout(runNext, CONSTS.WEAVE_MS);
    }, CONSTS.CHAOS_MS);
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  return {
    phase,
    cutA,
    cutB,
    startShuffle,
  };
}
