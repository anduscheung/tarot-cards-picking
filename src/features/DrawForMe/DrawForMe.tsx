/// <reference types="vite-plugin-svgr/client" />
import { FC, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Navigate, useOutletContext } from "react-router";
import SummonCircle from "./SummonCircle";
import styles from "./DrawForMe.module.scss";
import { useTarotCards } from "../../hooks/useTarotCards";
import { generateUniqueRandomNumbers } from "../../utils/cardDrawing.utils";
import DrawResults from "./DrawResults";
import { LocationState } from "../../types/locationStates";
import { ProtectedLayoutContext } from "../../layouts/ProtectedLayout/ProtectedLayout";
import { createDraw } from "../../services";
import { useChatGptPrompt } from "../../hooks/useChatGptPrompt";
import { ROUTES } from "../../routes";

const TOTAL_ANIMATION_DURATION = 12000;

const DrawForMe: FC = () => {
  const { data: cards, error } = useTarotCards();
  const location = useLocation();
  const { state } = location as { state: LocationState | null };
  const isDemo = location.pathname.startsWith(ROUTES.demo);
  const navigate = useNavigate();
  const question = state?.question ?? ""; // undefined on refresh/direct hit
  const { setShowReadingTopBar } = useOutletContext<ProtectedLayoutContext>();

  const [drawnCardIndexes, setDrawnCardIndexes] = useState<number[]>([]);
  const [allFlipped, setAllFlipped] = useState(false);
  const [createDrawError, setCreateDrawError] = useState<string | null>(null);
  const savedOnceRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDrawnCardIndexes(generateUniqueRandomNumbers(0, 77, 3));
    }, TOTAL_ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, []);

  // show top bar once all flipped
  useEffect(() => {
    setShowReadingTopBar(allFlipped);
    return () => setShowReadingTopBar(false);
  }, [allFlipped, setShowReadingTopBar]);

  useEffect(() => {
    if (isDemo) return; // NO saving function for demo

    // only run when: all flipped + not saved yet
    if (!cards || drawnCardIndexes.length === 0 || !allFlipped || savedOnceRef.current) return;

    savedOnceRef.current = true;

    (async () => {
      try {
        setCreateDrawError(null);

        await createDraw({
          mode: "draw-for-me",
          question,
          cards: drawnCardIndexes.map((index, idx) => ({
            name: cards[index].name,
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
  }, [isDemo, allFlipped, cards, drawnCardIndexes, question]);

  const { copyPrompt } = useChatGptPrompt({
    question,
    cards,
    cardIndexes: drawnCardIndexes,
  });

  if (!question) {
    return <Navigate to={isDemo ? ROUTES.demo : ROUTES.protectedHome} replace />;
  }
  if (error || !cards) return <p style={{ color: "red" }}>Failed to load cards.</p>;

  return (
    <div className={styles.page}>
      {drawnCardIndexes.length === 0 ? (
        <SummonCircle />
      ) : (
        <DrawResults
          cards={cards}
          drawnCardIndexes={drawnCardIndexes}
          onAllFlippedChange={setAllFlipped}
          onAskNextQuestion={() =>
            navigate(isDemo ? ROUTES.demo : ROUTES.protectedHome, { replace: true })
          }
          onAskChatGPT={copyPrompt}
          isDemo={isDemo}
          createDrawError={createDrawError}
        />
      )}
    </div>
  );
};

export default DrawForMe;
