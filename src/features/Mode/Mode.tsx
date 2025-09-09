import { useState } from "react";
import { useNavigate } from "react-router";
import Card from "./Card";
import styles from "./Mode.module.scss";

const Mode = () => {
  const [question, setQuestion] = useState("");
  const navigate = useNavigate();

  const onCardClick = (page: string) => {
    if (question.trim() === "") {
      alert("Please enter a question.");
      return;
    }
    navigate(page, { state: { question } });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Discover Your Tarot Insights</h1>
      <h5 className={styles.subTitle}>
        Ask your question, then discover your cards in the way that feels right to you.
      </h5>
      <div className={styles.textAreaContainer}>
        <textarea
          className={styles.questionTextArea}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do you need insight on today?"
        />
      </div>
      <div className={styles.cardContainer}>
        <Card
          title="Draw for Me"
          substring="The deck choose at random"
          onClick={() => onCardClick("/draw-for-me")}
        />
        <Card
          title="Let Me Pick"
          substring="You select three cards yourself"
          onClick={() => onCardClick("let-me-pick")}
        />
      </div>
    </div>
  );
};

export default Mode;
