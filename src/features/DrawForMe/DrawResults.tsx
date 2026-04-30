/// <reference types="vite-plugin-svgr/client" />
import { FC, useEffect, useState, useMemo } from "react";
import styles from "./DrawResults.module.scss";
import { type TarotCard } from "../../hooks/useTarotCards";
import GotoIcon from "../../assets/gotoIcon.svg?react";
import { imageUrlByIndex } from "../../utils/cardAssets";
import cardBackCopper from "/src/assets/cardBackCopper.png";
import cardBackSilver from "/src/assets/cardBackSilver.png";
import cardBackGold from "/src/assets/cardBackGold.png";

interface DrawResultsProps {
  cards: TarotCard[];
  drawnCardIndexes: number[];
  onAllFlippedChange: (value: boolean) => void;
  onAskChatGPT: () => void;
  onAskNextQuestion: () => void;
  createDrawError: string | null;
}

const DrawResults: FC<DrawResultsProps> = ({
  cards,
  drawnCardIndexes,
  onAllFlippedChange,
  onAskChatGPT,
  onAskNextQuestion,
  createDrawError,
}) => {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>(() =>
    drawnCardIndexes.reduce((acc, num) => ({ ...acc, [num]: false }), {}),
  );

  const revealCard = (num: number) => {
    setFlippedCards((prev) => {
      if (prev[num]) return prev;
      return { ...prev, [num]: true };
    });
  };

  const allFlipped = useMemo(
    () => drawnCardIndexes.every((num) => flippedCards[num]),
    [drawnCardIndexes, flippedCards],
  );

  useEffect(() => {
    onAllFlippedChange(allFlipped);
  }, [allFlipped, onAllFlippedChange]);

  return (
    <div className={styles.resultContainer}>
      <h3 className={styles.resultTitle}>Your Result:</h3>
      <div className={styles.cardsContainer}>
        {drawnCardIndexes.map((num, index) => {
          const card = cards[num];
          const isFlipped = flippedCards[num];
          return (
            <div key={`unflipped-${num}-${index}`} className={styles.cardBlock}>
              <div
                className={`${styles.card} ${isFlipped ? styles.flipped : ""}`}
                onClick={() => revealCard(num)}
                aria-label={`Reveal ${card.name}`}
              >
                <img className={styles.cardFront} src={imageUrlByIndex(num)} alt={card.name} />
                <img
                  className={styles.cardBack}
                  src={[cardBackCopper, cardBackSilver, cardBackGold][index]}
                  alt=""
                  aria-hidden="true"
                />
              </div>
              <div
                className={`${styles.cardDescription} ${styles.smallScreen} ${
                  isFlipped ? styles.active : ""
                }`}
              >
                <div className={`${styles.mask}`}>Tab the card to unveil the content</div>
                <h5>{card.name}</h5>
                <p>
                  <strong>Meaning:</strong> {card.meaning_up}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {allFlipped && (
        <>
          {drawnCardIndexes.map((num, index) => {
            const card = cards[num];
            return (
              <div
                className={`${styles.cardDescription} ${styles.largeScreen}`}
                key={`flipped-${num}-${index}`}
              >
                <h5>{card.name}</h5>
                <p>
                  <strong>Meaning:</strong> {card.meaning_up}
                </p>
              </div>
            );
          })}
          {createDrawError && <div className={styles.saveError}>{createDrawError}</div>}
          <div className={styles.buttonGroup}>
            <button className={styles.askChatGpt} onClick={onAskChatGPT}>
              Ask ChatGPT to explain it
              <GotoIcon />
            </button>
            <button className={styles.nextQuestion} onClick={onAskNextQuestion}>
              Ask the next question?
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DrawResults;
