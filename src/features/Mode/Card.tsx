import styles from "./Card.module.scss";

interface CardProps {
  title: string;
  substring: string;
}

const Card: React.FC<CardProps> = ({ title, substring }) => {
  return (
    <div className={styles.shimmerCard}>
      <div className={styles.shimmerCardInner}>
        <div className={`${styles.title} ${styles.text}`}>{title}</div>
        <div className={`${styles.substring} ${styles.text}`}>{substring}</div>
      </div>
    </div>
  );
};

export default Card;
