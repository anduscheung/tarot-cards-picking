/// <reference types="vite-plugin-svgr/client" />
import React, { useState, useEffect } from "react";
import SummonCircle from "./SummonCircle";
import "./AskAQuestion.scss";
import StarButton from "../../assets/starButton.svg?react";
import { generateUniqueRandomNumbers } from "../../utils/cardDrawing.utils";
import Results from "./Results";

const TOTAL_ANIMATION_DURATION = 10000;

function AskAQuestion() {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [numbers, setNumbers] = useState<number[] | null>(null);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        const randomNumbers = generateUniqueRandomNumbers(0, 77, 3);
        setNumbers(randomNumbers);
      }, TOTAL_ANIMATION_DURATION);

      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() === "") {
      alert("Please enter a question.");
      return;
    }
    setSubmitted(true);
  };

  const onClickNextQuestion = () => {
    setSubmitted(false);
    setQuestion("");
    setNumbers(null);
  };

  return (
    <div className="QuestionPageContainer">
      {!submitted && (
        <>
          <h1 className="title">Discover Your Tarot Insights</h1>
          <form onSubmit={handleSubmit} className="questionForm">
            <div className="textAreaContainer">
              <textarea
                className="questionTextArea"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What do you need insight on today?"
              />

              <button type="submit" className="submitIcon">
                <StarButton />
              </button>
            </div>
          </form>
        </>
      )}

      {submitted && !numbers && <SummonCircle />}

      {numbers && (
        <Results numbers={numbers} onClickNextQuestion={onClickNextQuestion} />
      )}
    </div>
  );
}

export default AskAQuestion;
