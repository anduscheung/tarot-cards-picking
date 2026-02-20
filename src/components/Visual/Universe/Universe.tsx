import styles from "./Universe.module.scss";

// Ellipse as SVG path (centered at 0,0)
function ellipsePath(rx: number, ry: number) {
  return `M ${rx} 0 A ${rx} ${ry} 0 1 1 ${-rx} 0 A ${rx} ${ry} 0 1 1 ${rx} 0`;
}

type Track = {
  rx: number;
  ry: number;
  tilt?: number; // degrees
  cx?: number; // center offset x (viewBox units)
  cy?: number; // center offset y
  width?: number; // stroke width
  speed?: number; // seconds per lap (planet)
  phase?: number; // 0..1 starting offset
};

// A small set of **fixed** tracks that approximate your screenshot
const TRACKS: Track[] = [
  { rx: 96, ry: 64, tilt: -8, cx: 0, cy: -6, width: 0.9, speed: 100, phase: 0.1 },
  { rx: 72, ry: 48, tilt: 12, cx: 2, cy: 4, width: 0.8, speed: 80, phase: 0.55 },
  { rx: 54, ry: 36, tilt: 0, cx: -3, cy: 0, width: 0.7, speed: 60, phase: 0.25 },
  { rx: 38, ry: 28, tilt: -18, cx: 1, cy: -2, width: 0.7, speed: 50, phase: 0.75 },
  { rx: 130, ry: 90, tilt: 6, cx: 0, cy: -10, width: 1.0, speed: 60, phase: 0.4 }, // large sweeping ring
];

const Universe = () => {
  // roomy square viewBox so lines can extend beyond edges
  const VB = { w: 240, h: 240 };

  return (
    <div aria-hidden className={styles.container}>
      <div className={styles.stage}>
        <svg
          viewBox={`${-VB.w / 2} ${-VB.h / 2} ${VB.w} ${VB.h}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
        >
          {TRACKS.map((track, i) => {
            const d = ellipsePath(track.rx, track.ry);
            const id = `orbit-${i}`;
            const strokeW = track.width ?? 0.8;
            const appearDelay = i === 0 ? 0 : 8 * i;

            return (
              <g
                key={i}
                transform={`translate(${track.cx ?? 0} ${track.cy ?? 0}) rotate(${track.tilt ?? 0})`}
              >
                {/* base orbit line */}
                <path
                  id={id}
                  d={d}
                  fill="none"
                  stroke={`rgba(255,185,58,0.45)`}
                  strokeWidth={strokeW}
                />
                {/* planet */}
                <circle
                  r={1.4 + (i % 3) * 0.3}
                  fill="#FFB93A"
                  visibility="hidden" // <- never paint at center
                >
                  {/* motion: give it an id so we can reference its begin event */}
                  <animateMotion
                    id={`am${i}`}
                    dur={`${track.speed ?? 36}s`}
                    repeatCount="indefinite"
                    begin={`${appearDelay}s`}
                  >
                    <mpath href={`#${id}`} />
                  </animateMotion>
                  {/* reveal only after the motion begins */}
                  <set
                    attributeName="visibility"
                    to="visible"
                    begin={`am${i}.begin + 0.001s`}
                    fill="freeze"
                  />
                  {/* fade/twinkle once visible */}
                  <animate
                    attributeName="opacity"
                    values="1;0.25;1"
                    dur={`${1.2 + i * 0.15}s`}
                    begin={`${appearDelay + 0.05}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default Universe;
