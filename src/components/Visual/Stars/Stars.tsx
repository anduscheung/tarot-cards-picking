import { FC, memo, useRef } from "react";
import { motion } from "framer-motion";
import styles from "./Stars.module.scss";

const Stars: FC = () => {
  // two slow layers for parallax drift
  return (
    <>
      {/* far layer */}
      <ParallaxStarLayer speed={90} shiftPct={-25} density={120} opacity={0.18} />
      {/* near layer */}
      <ParallaxStarLayer speed={60} shiftPct={-40} density={80} opacity={0.28} />
    </>
  );
};

export default Stars;

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
