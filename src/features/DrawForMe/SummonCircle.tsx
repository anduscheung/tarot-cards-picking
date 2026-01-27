/// <reference types="vite-plugin-svgr/client" />
import { FC, useEffect, useState } from "react";
import styles from "./SummonCircle.module.scss";
import RingOuter from "../../assets/summoning/ringOuter.svg?react";
import Star from "../../assets/summoning/star.svg?react";
import Symbols from "../../assets/summoning/symbols.svg?react";
import Words from "../../assets/summoning/words.svg?react";
import RingInner from "../../assets/summoning/ringInner.svg?react";
import Circle4 from "../../assets/summoning/circle4.svg?react";
import Circle3 from "../../assets/summoning/circle3.svg?react";
import Circle2 from "../../assets/summoning/circle2.svg?react";
import Circle1 from "../../assets/summoning/circle1.svg?react";

const SummonCircle: FC = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setTimeout(() => setActive(true), 500);
  }, []);

  if (!active) {
    return null;
  }

  return (
    <div className={styles.container}>
      <RingOuter className={styles.ringOuter} />
      <Symbols className={styles.symbols} />
      <Words className={styles.words} />
      <RingInner className={styles.ringInner} />
      <Circle4 className={styles.circle4} />
      <Circle3 className={styles.circle3} />
      <Circle2 className={styles.circle2} />
      <Circle1 className={styles.circle1} />
      <Star className={styles.star} />
    </div>
  );
};

export default SummonCircle;
