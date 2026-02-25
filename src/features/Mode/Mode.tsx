import { useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";
import { useNavigate } from "react-router";
import { TAROT_KEY } from "../../hooks/useTarotCards";
import { ROUTES } from "../../routes";
import Card from "./Card";
import styles from "./Mode.module.scss";
import Universe from "../../components/Visual/Universe";

const fetchCards = () => fetch("/tarot_cards.json", { cache: "force-cache" }).then((r) => r.json());

const Mode: FC = () => {
  const [question, setQuestion] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const onCardClick = (route: string) => {
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }
    navigate(route, { state: { question } });
  };

  const prefetch = () =>
    qc.prefetchQuery({ queryKey: TAROT_KEY, queryFn: fetchCards, staleTime: 3600_000 });

  return (
    <>
      <Universe />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Discover Your Tarot Insights</div>
          <div className={styles.subTitle}>
            Ask your question, then let fate or intuition guide you.
          </div>
        </div>
        <textarea
          className={styles.textArea}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do you need insight on today?"
          rows={2}
        />
        <div className={styles.cards}>
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
              onCardClick(ROUTES.pickMyOwn);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Mode;
