/// <reference types="vite-plugin-svgr/client" />
import React, { useState, useEffect } from "react";
import SummonCircle from "./SummonCircle";
import styles from "./AskAQuestion.module.scss";
import StarIcon from "../../assets/starIcon.svg?react";
import { generateUniqueRandomNumbers } from "../../utils/cardDrawing.utils";
import Results from "./Results";

const TOTAL_ANIMATION_DURATION = 12000;

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
    <div className={styles.QuestionPageContainer}>
      {!submitted && (
        <>
          <h1 className={styles.title}>Discover Your Tarot Insights</h1>
          <h5 className={styles.subTitle}>
            Ask a question, generate three cards that reveal the future or the
            best course of action.
          </h5>
          <form onSubmit={handleSubmit} className={styles.questionForm}>
            <div className={styles.textAreaContainer}>
              <textarea
                className={styles.questionTextArea}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What do you need insight on today?"
              />

              <button type="submit" className={styles.submitIcon}>
                <StarIcon className={styles.starIcon} />
              </button>
            </div>
          </form>
        </>
      )}

      {submitted && !numbers && <SummonCircle />}

      {numbers && (
        <Results
          numbers={numbers}
          onClickNextQuestion={onClickNextQuestion}
          question={question}
        />
      )}
    </div>
  );
}

export default AskAQuestion;
