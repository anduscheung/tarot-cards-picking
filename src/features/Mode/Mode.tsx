import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { TAROT_KEY } from "../../hooks/useTarotCards";
import { ROUTES } from "../../routes";
import Card from "./Card";
import styles from "./Mode.module.scss";

const fetchCards = () => fetch("/tarot_cards.json", { cache: "force-cache" }).then((r) => r.json());

const Mode = () => {
  const [question, setQuestion] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const onCardClick = (route: string) => {
    if (question.trim() === "") {
      alert("Please enter a question.");
      return;
    }
    navigate(route, { state: { question } });
  };

  const prefetch = () =>
    qc.prefetchQuery({ queryKey: TAROT_KEY, queryFn: fetchCards, staleTime: 3600_000 });

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
          onClick={() => {
            prefetch();
            onCardClick(ROUTES.drawForMe);
          }}
        />
        <Card
          title="Let Me Pick"
          substring="You select three cards yourself"
          onClick={() => {
            prefetch();
            onCardClick(ROUTES.letMePick);
          }}
        />
      </div>
    </div>
  );
};

export default Mode;
