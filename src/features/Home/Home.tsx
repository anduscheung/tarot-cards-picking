import { FC } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router";
import { motion } from "framer-motion";
import { ROUTES } from "../../routes";
import styles from "./Home.module.scss";
import Stars from "../../components/Visual/Stars";

const Home: FC = () => {
  const { modalOpen } = useOutletContext<{ modalOpen: boolean }>();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      {/* star background */}
      <Stars />
      {/* content */}
      <motion.div
        className={styles.content}
        animate={
          modalOpen
            ? { y: -40, scale: 0.98, filter: "brightness(0.95)" }
            : { y: 0, scale: 1, filter: "none" }
        }
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <motion.h1
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={styles.title}
        >
          Tarot Reading
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className={styles.subtitle}
        >
          Welcome back! Please log in.
        </motion.p>
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className={styles.btnWrap}
        >
          <div
            onClick={() => {
              navigate(ROUTES.login, { state: { background: location } });
            }}
            className={styles.btnLogin}
            data-modal-trigger="login"
          >
            Log in
          </div>
          <div
            onClick={() => {
              navigate(ROUTES.signup, { state: { background: location } });
            }}
            className={styles.btnSignup}
            data-modal-trigger="signup"
          >
            Sign up
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Home;
