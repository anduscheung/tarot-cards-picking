/// <reference types="vite-plugin-svgr/client" />
import { FC, useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router";
import styles from "./Results.module.scss";
import { useTarotCards } from "../../hooks/useTarotCards";
import { generatePromptForChatgpt } from "../../utils/cardDrawing.utils";
import GotoIcon from "../../assets/gotoIcon.svg?react";
import { imageUrlByIndex } from "../../utils/cardAssets";
import cardBackCopper from "/src/assets/cardBackCopper.png";
import cardBackSilver from "/src/assets/cardBackSilver.png";
import cardBackGold from "/src/assets/cardBackGold.png";
import { createDraw } from "../../services";
import { ROUTES } from "../../routes";
import { ProtectedLayoutContext } from "../../layouts/ProtectedLayout/ProtectedLayout";

interface ResultsProps {
  numbers: number[];
  question: string;
}

const Results: FC<ResultsProps> = ({ numbers, question }) => {
  const { data: cards } = useTarotCards();
  const navigate = useNavigate();
  const { setShowReadingTopBar } = useOutletContext<ProtectedLayoutContext>();

  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>(() =>
    numbers.reduce((acc, num) => ({ ...acc, [num]: false }), {}),
  );

  const toggleCardFlip = (num: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [num]: true,
    }));
  };

  const generateChatGptPrompt = () => {
    const prompt = generatePromptForChatgpt(
      question,
      numbers.map((num) => cards[num].name),
    );
    navigator.clipboard.writeText(prompt);
    alert("Prompt copied to clipboard! You can now paste it into ChatGPT.");
  };

  const allFlipped = useMemo(
    () => Object.values(flippedCards).length > 0 && Object.values(flippedCards).every(Boolean),
    [flippedCards],
  );

  const savedOnceRef = useRef(false);
  const [createDrawError, setCreateDrawError] = useState<string | null>(null);

  // show top bar once all flipped
  useEffect(() => {
    setShowReadingTopBar(allFlipped);
    return () => setShowReadingTopBar(false);
  }, [allFlipped, setShowReadingTopBar]);

  useEffect(() => {
    // only run when: all flipped + not saved yet
    if (!allFlipped || savedOnceRef.current) return;

    savedOnceRef.current = true;

    (async () => {
      try {
        setCreateDrawError(null);
        await createDraw({
          mode: "draw-for-me",
          question,
          cards: numbers.map((num, idx) => ({
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
  }, [allFlipped, cards, numbers, question]);

  return (
    <div className={styles.resultContainer}>
      <h3 className={styles.resultTitle}>Your Result:</h3>
      <div className={styles.cardsContainer}>
        {numbers.map((num, index) => (
          <div key={`${num}-${index}`} className={styles.cardBlock}>
            <div
              key={index}
              className={`${styles.card} ${flippedCards[num] ? styles.flipped : ""}`}
              onClick={() => toggleCardFlip(num)}
            >
              <img className={styles.cardFront} src={imageUrlByIndex(num)} alt={`Result ${num}`} />
              <img
                className={styles.cardBack}
                src={[cardBackCopper, cardBackSilver, cardBackGold][index]}
                alt={`Card back`}
              />
            </div>
            <div
              className={`${styles.cardDescription} ${styles.smallScreen} ${
                flippedCards[num] ? styles.active : ""
              }`}
              key={index}
            >
              <div className={`${styles.mask}`}>Tab the card to unveil the content</div>
              <h5>{cards[num].name}</h5>
              <p>{cards[num].desc}</p>
              <p>
                <strong>Meaning:</strong> {cards[num].meaning_up}
              </p>
            </div>
          </div>
        ))}
      </div>

      {Object.values(flippedCards).every((item) => item === true) && (
        <>
          {numbers.map((num, index) => (
            <div className={`${styles.cardDescription} ${styles.largeScreen}`} key={index}>
              <h5>{cards[num].name}</h5>
              <p>{cards[num].desc}</p>
              <p>
                <strong>Meaning:</strong> {cards[num].meaning_up}
              </p>
            </div>
          ))}
          {createDrawError && <div className={styles.saveError}>{createDrawError}</div>}
          <div className={styles.buttonGroup}>
            <div className={styles.chatGptLink}>
              <span onClick={generateChatGptPrompt}>Ask ChatGPT to explain it</span>
              <div className={styles.gotoIconWrapper}>
                <GotoIcon />
              </div>
            </div>
            <button className={styles.nextQuestion} onClick={() => navigate(ROUTES.protectedHome)}>
              Ask the next question?
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Results;
