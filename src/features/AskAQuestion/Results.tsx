import React, { useState } from "react";
import "./Results.scss";
import { cardData } from "./cardData";

interface ResultsProps {
  numbers: number[];
  onClickNextQuestion: () => void;
}

// Dynamically import all images in the `cards` folder
const images = import.meta.glob("/src/assets/cards/*.png", { eager: true });

const imageMap: Record<number, string> = Object.fromEntries(
  Object.entries(images).map(([path, module]) => {
    const imagePath = (module as { default: string }).default;
    const key = path.match(/(\d+)\.png$/)?.[1] ?? "";
    return [parseInt(key), imagePath];
  })
);

const Results: React.FC<ResultsProps> = ({ numbers, onClickNextQuestion }) => {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>(
    () => numbers.reduce((acc, num) => ({ ...acc, [num]: false }), {})
  );

  const toggleCardFlip = (num: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [num]: true,
    }));
  };

  return (
    <div className="resultContainer">
      <h3 className="resultTitle">Your Result:</h3>
      <div className="resultImages">
        {numbers.map((num, index) => (
          <div
            key={num}
            className={`card ${flippedCards[num] ? "flipped" : ""}`}
            onClick={() => toggleCardFlip(num)}
          >
            <img
              className="card-front"
              src={imageMap[num]}
              alt={`Result ${num}`}
            />
            <img
              className="card-back"
              src={
                [
                  "/src/assets/cardBackCopper.png",
                  "/src/assets/cardBackSilver.png",
                  "/src/assets/cardBackGold.png",
                ][index]
              }
              alt={`Card back`}
            />
          </div>
        ))}
      </div>

      {Object.values(flippedCards).every((item) => item === true) && (
        <>
          {numbers.map((num, index) => (
            <div className="cardDescription" key={index}>
              <h5>{cardData[num].name}</h5>
              <p>{cardData[num].desc}</p>
              <p>
                <strong>Meaning:</strong> {cardData[num].meaning_up}
              </p>
            </div>
          ))}
          <button onClick={onClickNextQuestion} className="askAgainButton">
            Ask another question
          </button>
        </>
      )}
    </div>
  );
};

export default Results;
