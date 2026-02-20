import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import Modal from "../../../components/Modal";
import { login } from "../../../services";
import { ROUTES } from "../../../routes";
import styles from "../AuthForm.module.scss";

export default function LoginModal() {
  const location = useLocation();
  const navigate = useNavigate();

  // If user was redirected here from a protected page, send the user back there after a successful login
  const from = (location.state as { from?: Location })?.from?.pathname ?? ROUTES.protectedHome;
  const open = location.pathname === ROUTES.login;
  const close = () => navigate(ROUTES.home, { replace: true });

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!email || !pw) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email, pw); // stores token in localStorage
      navigate(from, { replace: true });
    } catch {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  const onOutsideClick = (e: MouseEvent) => {
    const el = e.target as HTMLElement | null;
    if (el?.closest('[data-modal-trigger="login"]')) return true;
    if (el?.closest('[data-modal-trigger="signup"]')) {
      // Swap to signup instead of closing
      navigate(ROUTES.signup, { state: location.state });
      return true; // tell Modal "handled, don't call onClose"
    }
    // Return false/undefined to fall back to onClose()
  };

  return (
    <Modal open={open} onClose={close} onOutsideClick={onOutsideClick}>
      <motion.div
        className={styles.panel}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <div className={styles.inputBox}>
              <input
                className={styles.input}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <div className={styles.inputBox}>
              <input
                className={styles.input}
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className={styles.showBtn}
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error ? <div className={styles.error}>{error}</div> : null}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <div className={styles.swap}>
          Don’t have an account?{" "}
          <button className={styles.link} onClick={() => navigate(ROUTES.signup)}>
            Sign up
          </button>
        </div>
      </motion.div>
    </Modal>
  );
}
