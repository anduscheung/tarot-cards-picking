/// <reference types="vite-plugin-svgr/client" />
import React, { useState } from "react";
import styles from "./Results.module.scss";
import { cardData } from "../../constants/card.constants";
import { generatePromptForChatgpt } from "../../utils/cardDrawing.utils";
import GotoIcon from "../../assets/gotoIcon.svg?react";
import cardBackCopper from "/src/assets/cardBackCopper.png";
import cardBackSilver from "/src/assets/cardBackSilver.png";
import cardBackGold from "/src/assets/cardBackGold.png";

const images = import.meta.glob("/src/assets/cards/*.png", { eager: true });

const imageMap: Record<number, string> = Object.fromEntries(
  Object.entries(images).map(([path, module]) => {
    const imagePath = (module as { default: string }).default;
    const key = path.match(/(\d+)\.png$/)?.[1] ?? "";
    return [parseInt(key), imagePath];
  })
);

interface ResultsProps {
  numbers: number[];
  onClickNextQuestion: () => void;
  question: string;
}

const Results: React.FC<ResultsProps> = ({
  numbers,
  onClickNextQuestion,
  question,
}) => {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>(
    () => numbers.reduce((acc, num) => ({ ...acc, [num]: false }), {})
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
      numbers.map((num) => cardData[num].name)
    );
    navigator.clipboard.writeText(prompt);
    alert("Prompt copied to clipboard! You can now paste it into ChatGPT.");
  };

  return (
    <div className={styles.resultContainer}>
      <h3 className={styles.resultTitle}>Your Result:</h3>
      <div className={styles.cardsContainer}>
        {numbers.map((num, index) => (
          <>
            <div
              key={index}
              className={`${styles.card} ${
                flippedCards[num] ? styles.flipped : ""
              }`}
              onClick={() => toggleCardFlip(num)}
            >
              <img
                className={styles.cardFront}
                src={imageMap[num]}
                alt={`Result ${num}`}
              />
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
              <div className={`${styles.mask}`}>
                Tab the card to unveil the content
              </div>
              <h5>{cardData[num].name}</h5>
              <p>{cardData[num].desc}</p>
              <p>
                <strong>Meaning:</strong> {cardData[num].meaning_up}
              </p>
            </div>
          </>
        ))}
      </div>

      {Object.values(flippedCards).every((item) => item === true) && (
        <>
          {numbers.map((num, index) => (
            <div
              className={`${styles.cardDescription} ${styles.largeScreen}`}
              key={index}
            >
              <h5>{cardData[num].name}</h5>
              <p>{cardData[num].desc}</p>
              <p>
                <strong>Meaning:</strong> {cardData[num].meaning_up}
              </p>
            </div>
          ))}
          <div className={styles.buttonGroup}>
            <button
              onClick={onClickNextQuestion}
              className={styles.askAgainButton}
            >
              Ask another question
            </button>
            <div className={styles.chatGptLink}>
              <span onClick={generateChatGptPrompt}>
                Ask ChatGPT to explain it
              </span>
              <div className={styles.gotoIconWrapper}>
                <GotoIcon />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Results;
