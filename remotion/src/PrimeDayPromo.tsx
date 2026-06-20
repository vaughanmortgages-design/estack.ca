import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Colour tokens ────────────────────────────────────────────────────────────
const CHARCOAL = "#111111";
const CREAM = "#F5F0E8";
const BRASS = "#D4A853";
const MUTED_BRASS = "#4A4035";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fps = 30;
const f = (seconds: number) => Math.round(seconds * fps);

/** Clamp-interpolate that is undefined-safe */
function lerp(
  frame: number,
  startSec: number,
  endSec: number,
  from: number,
  to: number
) {
  return interpolate(frame, [f(startSec), f(endSec)], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// ─── Grain texture (SVG-based, rendered inline) ────────────────────────────────
function GrainOverlay() {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.06,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    >
      <filter id="grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.75"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

// ─── Sparkle / glint dot ──────────────────────────────────────────────────────
function Sparkle({
  x,
  y,
  delay,
  size = 6,
}: {
  x: number;
  y: number;
  delay: number;
  size?: number;
}) {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;

  const opacity = interpolate(localFrame, [0, 6, 12, 22], [0, 1, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(localFrame, [0, 6, 22], [0.2, 1.4, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const arms = [0, 45, 90, 135];

  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacity}>
      {arms.map((angle) => (
        <line
          key={angle}
          x1={0}
          y1={0}
          x2={0}
          y2={-size * scale}
          stroke={BRASS}
          strokeWidth={1.5}
          strokeLinecap="round"
          transform={`rotate(${angle})`}
        />
      ))}
      <circle cx={0} cy={0} r={size * 0.2 * scale} fill={CREAM} />
    </g>
  );
}

// ─── Wordmark: "THE STRAIGHT CUT" ────────────────────────────────────────────
function Wordmark() {
  const frame = useCurrentFrame();
  const opacity = lerp(frame, 0, 0.8, 0, 1);

  return (
    <div
      style={{
        opacity,
        textAlign: "center",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: 700,
        fontSize: 82,
        letterSpacing: "0.12em",
        color: CREAM,
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      THE STRAIGHT CUT
    </div>
  );
}

// ─── Brass underline that draws itself ────────────────────────────────────────
function BrassUnderline() {
  const frame = useCurrentFrame();
  const progress = lerp(frame, 1.5, 2.3, 0, 1);

  return (
    <svg
      width="680"
      height="8"
      viewBox="0 0 680 8"
      style={{ display: "block", margin: "10px auto 0" }}
    >
      <line
        x1={0}
        y1={4}
        x2={680 * progress}
        y2={4}
        stroke={BRASS}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── "PRIME DAY DROPS" slam-in ────────────────────────────────────────────────
function PrimeDayTitle() {
  const frame = useCurrentFrame();
  const { fps: videoFps } = useVideoConfig();

  const startFrame = f(2.5);
  const localFrame = frame - startFrame;

  const scale = localFrame >= 0
    ? spring({
        frame: localFrame,
        fps: videoFps,
        config: { damping: 8, stiffness: 180, mass: 0.8 },
        from: 0,
        to: 1,
      })
    : 0;

  const opacity = interpolate(localFrame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        textAlign: "center",
        fontFamily: "'Barlow Condensed', 'Impact', sans-serif",
        fontWeight: 700,
        fontSize: 112,
        letterSpacing: "0.05em",
        color: BRASS,
        lineHeight: 1,
        marginTop: 18,
        userSelect: "none",
      }}
    >
      PRIME DAY DROPS
    </div>
  );
}

// ─── Category card ────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Smart Home",
  "Outdoor & Patio",
  "Home Reno",
  "Canadian Exclusives",
];

function CategoryCard({
  label,
  delayFrames,
}: {
  label: string;
  delayFrames: number;
}) {
  const frame = useCurrentFrame();
  const { fps: videoFps } = useVideoConfig();

  const startFrame = f(4) + delayFrames;
  const localFrame = frame - startFrame;

  const translateY = localFrame >= 0
    ? spring({
        frame: localFrame,
        fps: videoFps,
        config: { damping: 14, stiffness: 160, mass: 0.9 },
        from: 80,
        to: 0,
      })
    : 80;

  const opacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: CHARCOAL,
        border: `2px solid ${BRASS}`,
        borderRadius: 6,
        padding: "28px 30px",
        minWidth: 230,
        flex: "1 1 0",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Barlow Condensed', 'Impact', sans-serif",
          fontWeight: 600,
          fontSize: 28,
          color: CREAM,
          letterSpacing: "0.06em",
          lineHeight: 1.2,
          userSelect: "none",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Cards row ────────────────────────────────────────────────────────────────
function CategoryCards() {
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        justifyContent: "center",
        width: "100%",
        padding: "0 60px",
        boxSizing: "border-box",
      }}
    >
      {CATEGORIES.map((cat, i) => (
        <CategoryCard
          key={cat}
          label={cat}
          delayFrames={Math.round(i * 0.3 * fps)}
        />
      ))}
    </div>
  );
}

// ─── Tagline ──────────────────────────────────────────────────────────────────
function Tagline() {
  const frame = useCurrentFrame();
  const opacity = lerp(frame, 9, 10, 0, 1);

  return (
    <div
      style={{
        opacity,
        fontFamily: "'Barlow Condensed', 'Impact', sans-serif",
        fontStyle: "italic",
        fontWeight: 500,
        fontSize: 34,
        color: MUTED_BRASS,
        letterSpacing: "0.08em",
        textAlign: "center",
        marginTop: 36,
        userSelect: "none",
      }}
    >
      Real tools. Real trades. No fluff.
    </div>
  );
}

// ─── CTA bar ─────────────────────────────────────────────────────────────────
function CTABar() {
  const frame = useCurrentFrame();
  const { fps: videoFps } = useVideoConfig();

  const startFrame = f(11);
  const localFrame = frame - startFrame;

  const translateY = localFrame >= 0
    ? spring({
        frame: localFrame,
        fps: videoFps,
        config: { damping: 16, stiffness: 140 },
        from: 100,
        to: 0,
      })
    : 100;

  const opacity = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        background: CHARCOAL,
        borderTop: `3px solid ${BRASS}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <span
        style={{
          fontFamily: "'Barlow Condensed', 'Impact', sans-serif",
          fontWeight: 700,
          fontSize: 38,
          letterSpacing: "0.14em",
          color: BRASS,
          userSelect: "none",
        }}
      >
        thestraightcut.net
      </span>
    </div>
  );
}

// ─── Sparkle overlay (SVG, full-screen) ──────────────────────────────────────
function SparkleLayer() {
  const frame = useCurrentFrame();

  // Sparkles appear after brass elements are visible: underline ~2.3s, slam ~3s
  const sparkles = [
    // Along underline
    { x: 640, y: 398, delay: f(2.4) },
    { x: 960, y: 398, delay: f(2.6) },
    { x: 1280, y: 398, delay: f(2.8) },
    // On PRIME DAY DROPS
    { x: 820, y: 510, delay: f(3.1), size: 8 },
    { x: 1100, y: 510, delay: f(3.3), size: 8 },
    // Repeat cycle — second wave
    { x: 700, y: 398, delay: f(5.5) },
    { x: 1000, y: 398, delay: f(5.8) },
    { x: 1200, y: 395, delay: f(6.1), size: 7 },
  ];

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      viewBox="0 0 1920 1080"
    >
      {sparkles.map((s, i) => (
        <Sparkle key={i} x={s.x} y={s.y} delay={s.delay} size={s.size ?? 6} />
      ))}
    </svg>
  );
}

// ─── Fade-to-black veil ───────────────────────────────────────────────────────
function FadeOut() {
  const frame = useCurrentFrame();
  const opacity = lerp(frame, 14, 14.5, 0, 1);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#000",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Main composition ─────────────────────────────────────────────────────────
export const PrimeDayPromo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: CHARCOAL,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Grain texture */}
      <GrainOverlay />

      {/* Content stack */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          paddingBottom: 100,
        }}
      >
        <Wordmark />
        <BrassUnderline />
        <PrimeDayTitle />

        <div style={{ height: 48 }} />

        <CategoryCards />

        <Tagline />
      </div>

      {/* Sparkles */}
      <SparkleLayer />

      {/* CTA bar */}
      <CTABar />

      {/* Fade to black */}
      <FadeOut />
    </AbsoluteFill>
  );
};
