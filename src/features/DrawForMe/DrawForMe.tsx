/// <reference types="vite-plugin-svgr/client" />
import { useState, useEffect } from "react";
import { useLocation, Navigate } from "react-router";
import SummonCircle from "./SummonCircle";
import styles from "./DrawForMe.module.scss";
import { generateUniqueRandomNumbers } from "../../utils/cardDrawing.utils";
import Results from "./Results";

const TOTAL_ANIMATION_DURATION = 12000;
type LocationState = { question?: string };

const DrawForMe = () => {
  const [numbers, setNumbers] = useState<number[] | null>(null);
  const { state } = useLocation() as { state: LocationState | null };
  const question = state?.question ?? ""; // undefined on refresh/direct hit

  useEffect(() => {
    const timer = setTimeout(() => {
      const randomNumbers = generateUniqueRandomNumbers(0, 77, 3);
      setNumbers(randomNumbers);
    }, TOTAL_ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, []);

  if (!question) return <Navigate to="/" replace />;

  return (
    <div className={styles.QuestionPageContainer}>
      {!numbers && <SummonCircle />}

      {numbers && <Results numbers={numbers} question={question} />}
    </div>
  );
};

export default DrawForMe;
