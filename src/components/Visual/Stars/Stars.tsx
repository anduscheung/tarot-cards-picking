import { FC, memo, useRef } from "react";
import { motion } from "framer-motion";
import styles from "./Stars.module.scss";

type StarsVariant = "gold" | "white";
interface StarsProps {
  variant?: StarsVariant;
}
const Stars: FC<StarsProps> = ({ variant = "gold" }) => {
  return (
    <>
      {variant === "gold" ? (
        <>
          {/* far layer */}
          <ParallaxStarLayer
            speed={90}
            shiftPct={-25}
            density={120}
            opacity={0.18}
            variant={variant}
          />
          {/* near layer */}
          <ParallaxStarLayer
            speed={60}
            shiftPct={-40}
            density={80}
            opacity={0.28}
            variant={variant}
          />
        </>
      ) : (
        <>
          {/* far layer */}
          <ParallaxStarLayer
            speed={130}
            shiftPct={-25}
            density={420}
            opacity={0.22}
            variant={variant}
          />
          {/* near layer */}
          <ParallaxStarLayer
            speed={100}
            shiftPct={-40}
            density={160}
            opacity={0.7}
            variant={variant}
          />
        </>
      )}
    </>
  );
};

export default Stars;

function ParallaxStarLayer({
  speed,
  shiftPct,
  density,
  opacity,
  variant,
}: {
  speed: number; // seconds per loop
  shiftPct: number; // how far to drift (negative = left)
  density: number;
  opacity: number;
  variant: StarsVariant;
}) {
  return (
    <div className={styles.starsLayer}>
      <motion.div
        animate={{ x: ["0%", `${shiftPct}%`, "0%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "140%", height: "100%" }}
      >
        <StarField density={density} opacity={opacity} variant={variant} />
      </motion.div>
    </div>
  );
}

const StarField = memo(function StarField({
  density,
  opacity = 0.25,
  variant = "gold",
}: {
  density: number;
  opacity?: number;
  variant?: StarsVariant;
}) {
  // generate ONCE, keep forever
  const dotsRef = useRef(
    Array.from({ length: density }, () => {
      const isGold = variant === "gold";

      return {
        x: Math.random() * 120, // extend beyond right edge for drift room
        y: Math.random() * 100,
        r: isGold
          ? Math.random() * 0.5 + 0.15 // [0.15, 0.65)
          : Math.random() * 0.1 + 0.08,
        tw: isGold
          ? Math.random() * 0.8 + 0.6 // twinkle duration 0.6s to 1.4s
          : Math.random() * 2.6 + 2.2,
        dly: Math.random() * 2, // // 0 to 2s delay}
        fill: isGold ? "#FFB93A" : "rgba(255,255,255,0.95)",
      };
    }),
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
          fill={d.fill}
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, opacity, 0.15] }}
          transition={{ duration: d.tw, repeat: Infinity, ease: "easeInOut", delay: d.dly }}
        />
      ))}
    </svg>
  );
});
