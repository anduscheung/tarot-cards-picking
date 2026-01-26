import { memo, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ROUTES } from "../../routes";
import styles from "./Home.module.scss";

export default function Home() {
  const navigate = useNavigate();
  return (
    <>
      {/* star background */}
      <Stars />
      {/* content */}
      <div className={styles.content}>
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
              navigate(ROUTES.login);
            }}
            className={styles.btnLogin}
          >
            Log in
          </div>
          <div
            onClick={() => {
              navigate(ROUTES.signup);
            }}
            className={styles.btnSignup}
          >
            Sign up
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ---------- Decorative pieces (pure SVG) ---------- */
function Stars() {
  // two slow layers for parallax drift
  return (
    <>
      {/* far layer */}
      <ParallaxStarLayer speed={90} shiftPct={-25} density={120} opacity={0.18} />
      {/* near layer */}
      <ParallaxStarLayer speed={60} shiftPct={-40} density={80} opacity={0.28} />
    </>
  );
}

function ParallaxStarLayer({
  speed,
  shiftPct,
  density,
  opacity,
}: {
  speed: number; // seconds per loop
  shiftPct: number; // how far to drift (negative = left)
  density: number;
  opacity: number;
}) {
  return (
    <div className={styles.starsLayer}>
      <motion.div
        animate={{ x: ["0%", `${shiftPct}%`, "0%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "140%", height: "100%" }}
      >
        <StarField density={density} color={"#FFB93A"} opacity={opacity} />
      </motion.div>
    </div>
  );
}

const StarField = memo(function StarField({
  density,
  color,
  opacity = 0.25,
}: {
  density: number;
  color: string;
  opacity?: number;
}) {
  // generate ONCE, keep forever
  const dotsRef = useRef(
    Array.from({ length: density }, () => ({
      x: Math.random() * 120, // extend beyond right edge for drift room
      y: Math.random() * 100,
      r: Math.random() * 0.5 + 0.15, // [0.15, 0.65)
      tw: Math.random() * 0.8 + 0.6, // twinkle duration 0.6s to 1.4s
      dly: Math.random() * 2, // // 0 to 2s delay
    })),
  );
  const dots = dotsRef.current;

  return (
    <svg
      viewBox="0 0 120 100"
      preserveAspectRatio="xMidYMid slice" // <- keep geometry stable
      className={styles.starSvg}
    >
      {dots.map((d, i) => (
        <motion.circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill={color}
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, opacity, 0.15] }}
          transition={{ duration: d.tw, repeat: Infinity, ease: "easeInOut", delay: d.dly }}
        />
      ))}
    </svg>
  );
});
