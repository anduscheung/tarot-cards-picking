import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import Modal from "../../../components/Modal";
import { signup } from "../../../services";
import { ROUTES } from "../../../routes";
import styles from "../AuthForm.module.scss";

export default function SignupModal() {
  const location = useLocation();
  const navigate = useNavigate();

  const open = location.pathname === ROUTES.signup;
  const close = () => navigate(ROUTES.home, { replace: true });

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!email || !pw) {
      setError("Please fill in email and password.");
      return;
    }

    try {
      setLoading(true);
      await signup(email, pw, displayName.trim()); // stores token in localStorage
      navigate(ROUTES.protectedHome, { replace: true });
    } catch (err: unknown) {
      const e = err as {
        status?: number;
        details?: { errors?: Record<string, string[]> };
      };

      const status = e?.status;
      const errors = e?.details?.errors;

      if (errors?.password?.length) {
        setError("Password length must be at least 6 characters.");
        return;
      }

      if (status === 409 || errors?.email?.length) {
        setError("Sign up failed. Please try a different email.");
        return;
      }

      setError("Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const onOutsideClick = (e: MouseEvent) => {
    const el = e.target as HTMLElement | null;
    if (el?.closest('[data-modal-trigger="signup"]')) return true;
    if (el?.closest('[data-modal-trigger="login"]')) {
      // Swap to login instead of closing
      navigate(ROUTES.login, { state: location.state });
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
          <div className={styles.subtitle}>Create your account</div>
          <label className={styles.field}>
            <span className={styles.label}>Email *</span>
            <div className={styles.inputBox}>
              <input
                className={styles.input}
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Display name</span>
            <div className={styles.inputBox}>
              <input
                className={styles.input}
                type="text"
                autoComplete="nickname"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
              />
            </div>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Password *</span>
            <div className={styles.inputBox}>
              <input
                className={styles.input}
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className={styles.swap}>
          Already have an account?{" "}
          <button
            className={styles.link}
            onClick={() => navigate(ROUTES.login, { state: location.state })}
          >
            Log in
          </button>
        </div>
      </motion.div>
    </Modal>
  );
}
