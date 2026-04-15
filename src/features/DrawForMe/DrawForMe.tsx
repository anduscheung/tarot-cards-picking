/// <reference types="vite-plugin-svgr/client" />
import { FC, useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, Navigate, useOutletContext } from "react-router";
import SummonCircle from "./SummonCircle";
import styles from "./DrawForMe.module.scss";
import { useTarotCards } from "../../hooks/useTarotCards";
import { generateUniqueRandomNumbers } from "../../utils/cardDrawing.utils";
import DrawResults from "./DrawResults";
import { LocationState } from "../../types/locationStates";
import { ProtectedLayoutContext } from "../../layouts/ProtectedLayout/ProtectedLayout";
import { createDraw } from "../../services";
import { generatePromptForChatgpt } from "../../utils/cardDrawing.utils";
import { ROUTES } from "../../routes";

const TOTAL_ANIMATION_DURATION = 12000;

const DrawForMe: FC = () => {
  const { data: cards, error } = useTarotCards();
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState | null };
  const question = state?.question ?? ""; // undefined on refresh/direct hit
  const { setShowReadingTopBar } = useOutletContext<ProtectedLayoutContext>();

  const [drawnCardIndexes, setDrawnCardIndexes] = useState<number[] | null>(null);
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
    // only run when: all flipped + not saved yet
    if (!cards || !drawnCardIndexes || !allFlipped || savedOnceRef.current) return;

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
  }, [allFlipped, cards, drawnCardIndexes, question]);

  const chatGptPrompt = useMemo(() => {
    if (!cards || !drawnCardIndexes) return "";
    return generatePromptForChatgpt(
      question,
      drawnCardIndexes.map((index) => cards[index].name),
    );
  }, [cards, drawnCardIndexes, question]);

  const copyChatGPTPrompt = async () => {
    if (!chatGptPrompt) return;
    await navigator.clipboard.writeText(chatGptPrompt);
    alert("Prompt copied to clipboard! You can now paste it into ChatGPT.");
  };

  if (!question) return <Navigate to={ROUTES.protectedHome} replace />;
  if (error || !cards) return <p style={{ color: "red" }}>Failed to load cards.</p>;

  return (
    <div className={styles.page}>
      {!drawnCardIndexes ? (
        <SummonCircle />
      ) : (
        <DrawResults
          cards={cards}
          drawnCardIndexes={drawnCardIndexes}
          onAllFlippedChange={setAllFlipped}
          onAskNextQuestion={() => navigate(ROUTES.protectedHome, { replace: true })}
          onAskChatGPT={copyChatGPTPrompt}
          createDrawError={createDrawError}
        />
      )}
    </div>
  );
};

export default DrawForMe;
