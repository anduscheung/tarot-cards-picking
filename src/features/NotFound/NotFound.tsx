import { FC } from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "../../routes";
import { getToken, isTokenValid } from "../../utils/auth";
import styles from "./NotFound.module.scss";

const NotFound: FC = () => {
  const navigate = useNavigate();
  const authed = isTokenValid(getToken());

  const handleReturn = () => {
    navigate(authed ? ROUTES.protectedHome : ROUTES.home, { replace: true });
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.code}>404</h1>
      <div className={styles.title}>The cards reveal... this path does not exist</div>
      <div className={styles.subtitle}>Perhaps fate wants you somewhere else</div>
      <button className={styles.button} onClick={handleReturn}>
        Return Home
      </button>
    </div>
  );
};

export default NotFound;
