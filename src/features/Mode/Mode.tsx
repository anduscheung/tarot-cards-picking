import { useState } from "react";
import Card from "./Card";
import styles from "./Mode.module.scss";

const Mode = () => {
  const [question, setQuestion] = useState("");

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Discover Your Tarot Insights</h1>
      <h5 className={styles.subTitle}>
        Ask your question, then discover your cards in the way that feels right to you.
      </h5>
      <form
        //   onSubmit={handleSubmit}
        className={styles.questionForm}
      >
        <div className={styles.textAreaContainer}>
          <textarea
            className={styles.questionTextArea}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What do you need insight on today?"
          />
        </div>
      </form>
      <div className={styles.cardContainer}>
        <Card title="Draw for Me" substring="The deck choose at random" />
        <Card title="Let Me Pick" substring="You select three cards yourself" />
      </div>
    </div>
  );
};

export default Mode;
