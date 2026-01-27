import { FC } from "react";
import styles from "./Card.module.scss";

interface CardProps {
  title: string;
  substring: string;
  onClick?: () => void;
}

const Card: FC<CardProps> = ({ title, substring, onClick }) => {
  return (
    <div onClick={onClick} className={styles.shimmerCard}>
      <div className={styles.shimmerCardInner}>
        <div className={styles.content}>
          <div className={`${styles.title} ${styles.text}`}>{title}</div>
          <div className={`${styles.substring} ${styles.text}`}>{substring}</div>
        </div>
      </div>
    </div>
  );
};

export default Card;
