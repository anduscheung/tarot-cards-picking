import { FC } from "react";
import styles from "./Card.module.scss";

interface CardProps {
  title: string;
  onClick: () => void;
  substring?: string;
}

const Card: FC<CardProps> = ({ title, substring, onClick }) => {
  return (
    <button className={styles.card} onClick={onClick}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.substring}>{substring}</p>
      <div className={styles.cornerCue} aria-hidden>
        ➜
      </div>
    </button>
  );
};

export default Card;
