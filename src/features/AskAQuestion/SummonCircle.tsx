/// <reference types="vite-plugin-svgr/client" />
import "./SummonCircle.scss";
import RingOuter from "../../assets/summoning/ringOuter.svg?react";
import Star from "../../assets/summoning/star.svg?react";
import Symbols from "../../assets/summoning/symbols.svg?react";
import Words from "../../assets/summoning/words.svg?react";
import RingInner from "../../assets/summoning/ringInner.svg?react";
import Circle4 from "../../assets/summoning/circle4.svg?react";
import Circle3 from "../../assets/summoning/circle3.svg?react";
import Circle2 from "../../assets/summoning/circle2.svg?react";
import Circle1 from "../../assets/summoning/circle1.svg?react";
import { useEffect, useState } from "react";

function SummonCircle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setTimeout(() => setActive(true), 500);
  }, []);

  if (!active) {
    return null;
  }

  return (
    <div className="container">
      <RingOuter className="ringOuter" />
      <Symbols className="symbols" />
      <Words className="words" />
      <RingInner className="ringInner" />
      <Circle4 className="circle4" />
      <Circle3 className="circle3" />
      <Circle2 className="circle2" />
      <Circle1 className="circle1" />
      <Star className="star" />
    </div>
  );
}

export default SummonCircle;
