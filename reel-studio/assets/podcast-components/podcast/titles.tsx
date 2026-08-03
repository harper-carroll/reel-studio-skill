import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { TITLE_FONT, BODY_FONT, FPS } from "./layout";

// ---------------------------------------------------------------------------
// Title system modeled frame-by-frame on the "How does AI work? episode 01"
// reference reel:
//  - a soft black gradient scrim blooms on the VIDEO behind the title (the
//    "shadow dropdown" depth) rather than a hard text drop shadow
//  - each word enters heavily gaussian-blurred + transparent + slightly large,
//    then settles sharp; words are staggered
//  - exit is a blur+fade of the whole lockup
// ---------------------------------------------------------------------------

const easeOut = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

// Soft dark gradient on the footage behind a title; opacity animates with the
// title. `fade` = where (0-1 of frame height) the gradient reaches transparent —
// keep it ABOVE the speaker's face (a face inside the scrim reads underlit).
export const Scrim: React.FC<{ enterF: number; exitF: number; fade?: number }> = ({
  enterF,
  exitF,
  fade = 0.48,
}) => {
  const frame = useCurrentFrame();
  const a =
    easeOut((frame - enterF) / (0.6 * FPS)) *
    (1 - easeOut((frame - exitF) / (0.5 * FPS)));
  const p = (f: number) => `${(fade * f * 100).toFixed(1)}%`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: a,
        background: `linear-gradient(180deg, rgba(6,6,9,0.68) 0%, rgba(6,6,9,0.48) ${p(0.42)}, rgba(6,6,9,0.2) ${p(0.71)}, rgba(6,6,9,0) ${p(1)})`,
      }}
    />
  );
};

// One word/line that blurs in at `enterF` and (with the parent) blurs out.
const BlurIn: React.FC<{
  enterF: number;
  exitF: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ enterF, exitF, children, style }) => {
  const frame = useCurrentFrame();
  const tIn = easeOut((frame - enterF) / (0.62 * FPS));
  const tOut = easeOut((frame - exitF) / (0.45 * FPS));
  const blur = 26 * (1 - tIn) + 22 * tOut;
  const opacity = tIn * (1 - tOut);
  const scale = 1.07 - 0.07 * tIn;
  if (opacity <= 0.001) return null;
  return (
    <div
      style={{
        filter: `blur(${blur.toFixed(1)}px)`,
        opacity,
        transform: `scale(${scale.toFixed(3)})`,
        willChange: "filter, opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const titleText: React.CSSProperties = {
  fontFamily: TITLE_FONT,
  fontStyle: "italic",
  color: "#FAF6ED",
  textAlign: "center",
  textShadow: "0 4px 26px rgba(0,0,0,0.45)",
  lineHeight: 0.98,
};

// Segment 1 — the opening lockup on the cream panel: INK serif, orange "ai" in
// "explained". Four arrangements, each a different answer to "what's the hero?":
//  duel      — the two terms get EQUAL billing with an orange "vs" pivot
//              (it's a comparison video; neither term outranks the other)
//  weights   — "open weights" hero (the unfamiliar term carries the curiosity)
//  explained — "explained" hero (the promise + the ai easter egg gets top billing)
//  footer    — series kicker drops to a panel footer; the title breathes larger
export type LockupVariant = "reference" | "duel" | "weights" | "explained" | "footer";

const AI = ({ size }: { size?: number }) => (
  <span style={{ color: "#E8663C", fontSize: size }}>ai</span>
);

export const TitleLockup: React.FC<{
  durationInFrames: number;
  variant?: LockupVariant;
  entered?: boolean; // continuing across a cut — everything already on screen
}> = ({ durationInFrames, variant = "reference", entered }) => {
  // no title fade-out — it holds and cuts with the shot
  const exitF = durationInFrames + 30;
  const e = (t: number) => (entered ? -100 : Math.round(t * FPS));
  const ink: React.CSSProperties = {
    fontFamily: TITLE_FONT,
    fontStyle: "italic",
    color: "#2E2A24",
    textAlign: "center",
    lineHeight: 0.98,
  };
  const kicker = (
    <div style={{ ...ink, fontSize: 46, fontWeight: 500, color: "#7E786D" }}>
      Open Model Series, <span style={{ fontSize: 34 }}>episode 2:</span>
    </div>
  );

  if (variant === "reference") {
    // The ep01 look, verbatim: piecewise white italic serif over a top scrim on
    // the FOOTAGE (no panel), small/HUGE/small + tiny series line. Holds to cut.
    return (
      <>
        <Scrim enterF={entered ? -100 : e(0.1)} exitF={exitF} fade={0.5} />
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 258 }}>
          <BlurIn enterF={e(0.15)} exitF={exitF}>
            <div style={{ ...titleText, fontSize: 96, fontWeight: 500 }}>
              open source vs
            </div>
          </BlurIn>
          <BlurIn enterF={e(0.5)} exitF={exitF}>
            <div style={{ ...titleText, fontSize: 188, fontWeight: 600, marginTop: 4 }}>
              open weights
            </div>
          </BlurIn>
          <BlurIn enterF={e(0.88)} exitF={exitF}>
            <div style={{ ...titleText, fontSize: 90, fontWeight: 550, marginTop: 14 }}>
              expl<AI />ned
            </div>
          </BlurIn>
          <BlurIn enterF={e(1.2)} exitF={exitF}>
            <div
              style={{
                ...titleText,
                fontSize: 42,
                fontWeight: 500,
                marginTop: 26,
                letterSpacing: "0.06em",
                opacity: 0.92,
              }}
            >
              Open Model Series · episode 2
            </div>
          </BlurIn>
        </AbsoluteFill>
      </>
    );
  }

  if (variant === "duel") {
    return (
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 138 }}>
        <BlurIn enterF={e(0.08)} exitF={exitF}>{kicker}</BlurIn>
        <BlurIn enterF={e(0.32)} exitF={exitF}>
          <div style={{ ...ink, fontSize: 126, fontWeight: 600, marginTop: 36 }}>
            open source
          </div>
        </BlurIn>
        <BlurIn enterF={e(0.56)} exitF={exitF}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              marginTop: 18,
            }}
          >
            <div style={{ width: 120, height: 3, background: "#CBC2B2" }} />
            <div style={{ ...ink, fontSize: 60, fontWeight: 550, color: "#E8663C" }}>
              vs
            </div>
            <div style={{ width: 120, height: 3, background: "#CBC2B2" }} />
          </div>
        </BlurIn>
        <BlurIn enterF={e(0.78)} exitF={exitF}>
          <div style={{ ...ink, fontSize: 126, fontWeight: 600, marginTop: 18 }}>
            open weights
          </div>
        </BlurIn>
        <BlurIn enterF={e(1.05)} exitF={exitF}>
          <div
            style={{
              ...ink,
              fontSize: 70,
              fontWeight: 550,
              marginTop: 26,
              letterSpacing: "0.05em",
            }}
          >
            expl<AI />ned
          </div>
        </BlurIn>
      </AbsoluteFill>
    );
  }

  if (variant === "explained") {
    return (
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <BlurIn enterF={e(0.08)} exitF={exitF}>{kicker}</BlurIn>
        <BlurIn enterF={e(0.32)} exitF={exitF}>
          <div style={{ ...ink, fontSize: 104, fontWeight: 550, marginTop: 46 }}>
            open source
          </div>
        </BlurIn>
        <BlurIn enterF={e(0.56)} exitF={exitF}>
          <div style={{ ...ink, fontSize: 104, fontWeight: 550, marginTop: 8 }}>
            <span style={{ fontSize: 66, color: "#7E786D" }}>vs</span> open weights
          </div>
        </BlurIn>
        <BlurIn enterF={e(0.9)} exitF={exitF}>
          <div style={{ ...ink, fontSize: 168, fontWeight: 600, marginTop: 34 }}>
            expl<AI />ned
          </div>
        </BlurIn>
      </AbsoluteFill>
    );
  }

  if (variant === "footer") {
    return (
      <>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
          <BlurIn enterF={e(0.1)} exitF={exitF}>
            <div style={{ ...ink, fontSize: 118, fontWeight: 550 }}>
              open source vs
            </div>
          </BlurIn>
          <BlurIn enterF={e(0.4)} exitF={exitF}>
            <div style={{ ...ink, fontSize: 182, fontWeight: 600, marginTop: 6 }}>
              open weights
            </div>
          </BlurIn>
          <BlurIn enterF={e(0.75)} exitF={exitF}>
            <div style={{ ...ink, fontSize: 108, fontWeight: 550, marginTop: 22 }}>
              expl<AI />ned
            </div>
          </BlurIn>
        </AbsoluteFill>
        <BlurIn
          enterF={e(1.05)}
          exitF={exitF}
          style={{ position: "absolute", left: 0, top: 918, width: 1080 }}
        >
          <div
            style={{
              ...ink,
              fontSize: 40,
              fontWeight: 500,
              color: "#9B937F",
              letterSpacing: "0.08em",
            }}
          >
            Open Model Series · episode 2
          </div>
        </BlurIn>
      </>
    );
  }

  // "weights" — the refined original hierarchy
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 148 }}>
      <BlurIn enterF={e(0.08)} exitF={exitF}>{kicker}</BlurIn>
      <BlurIn enterF={e(0.32)} exitF={exitF}>
        <div style={{ ...ink, fontSize: 96, fontWeight: 500, marginTop: 34 }}>
          open source vs
        </div>
      </BlurIn>
      <BlurIn enterF={e(0.58)} exitF={exitF}>
        <div style={{ ...ink, fontSize: 175, fontWeight: 600, marginTop: 4 }}>
          open weights
        </div>
      </BlurIn>
      <BlurIn enterF={e(0.92)} exitF={exitF}>
        <div style={{ ...ink, fontSize: 92, fontWeight: 550, marginTop: 18 }}>
          expl<AI />ned
        </div>
      </BlurIn>
    </AbsoluteFill>
  );
};

// Speaker ID: name in the title serif + credentials in Helvetica, with a curved
// hand-drawn arrow pointing at the speaker. Blur-in/out like everything else.
export const NameTag: React.FC<{
  lines: [string, ...string[]];
  x: number;
  y: number;
  width: number;
  align: "left" | "right";
  // bend curves perpendicular to the chord; cp overrides with an explicit
  // control point (e.g. the "go right, then curve back inward" hook).
  arrow: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    bend: number;
    cp?: { x: number; y: number };
  };
  enterF: number;
  exitF: number;
  color?: "cream" | "ink"; // ink = darker (cream can wash out on a light wall)
}> = ({ lines, x, y, width, align, arrow, enterF, exitF, color = "ink" }) => {
  const [name, ...creds] = lines;
  const fg = color === "ink" ? "#3B362E" : "#FAF6ED";
  const shadow =
    color === "ink" ? "0 1px 10px rgba(250,246,237,0.4)" : "0 2px 18px rgba(0,0,0,0.5)";
  const mx = (arrow.x1 + arrow.x2) / 2;
  const my = (arrow.y1 + arrow.y2) / 2;
  const dx = arrow.x2 - arrow.x1;
  const dy = arrow.y2 - arrow.y1;
  const len = Math.hypot(dx, dy) || 1;
  // control point: explicit cp wins; otherwise offset perpendicular by bend
  const cx = arrow.cp ? arrow.cp.x : mx - (dy / len) * arrow.bend;
  const cy = arrow.cp ? arrow.cp.y : my + (dx / len) * arrow.bend;
  // arrowhead direction at the endpoint (from control point to tip)
  const ang = Math.atan2(arrow.y2 - cy, arrow.x2 - cx);
  const head = (a: number) =>
    `${arrow.x2 - 16 * Math.cos(ang + a)},${arrow.y2 - 16 * Math.sin(ang + a)}`;
  return (
    <BlurIn enterF={enterF} exitF={exitF} style={{ position: "absolute", left: 0, top: 0 }}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width,
          textAlign: align,
          color: fg,
          textShadow: shadow,
        }}
      >
        <div
          style={{
            fontFamily: TITLE_FONT,
            fontStyle: "italic",
            fontSize: 56,
            fontWeight: 600,
            lineHeight: 1.08,
          }}
        >
          {name}
        </div>
        {creds.map((c) => (
          <div
            key={c}
            style={{
              fontFamily: BODY_FONT,
              fontSize: 33,
              fontWeight: 500,
              lineHeight: 1.3,
              opacity: 0.94,
            }}
          >
            {c}
          </div>
        ))}
      </div>
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      >
        <path
          d={`M ${arrow.x1} ${arrow.y1} Q ${cx} ${cy} ${arrow.x2} ${arrow.y2}`}
          stroke={fg}
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
        />
        <polyline
          points={`${head(0.5)} ${arrow.x2},${arrow.y2} ${head(-0.5)}`}
          stroke={fg}
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </BlurIn>
  );
};

// Segment 2 — the spectrum GRAPHIC (not the word, the concept): a
// three-stop gradient bar wiping in — closed → open weight → open source.
export const SpectrumGraphic: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const enterF = Math.round(0.15 * FPS);
  const exitF = durationInFrames + 30; // holds to the cut
  const wipe = easeOut((frame - enterF) / (0.65 * FPS));
  const stops = [
    { label: "closed", color: "#2E2A24", at: 0.5 },
    { label: "open weight", color: "#DE5F3B", at: 0.75 },
    { label: "open source", color: "#6E93CE", at: 1.0 },
  ];
  return (
    <>
      <Scrim enterF={enterF} exitF={exitF} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 265 }}>
        <div style={{ position: "relative", width: 840 }}>
          <div
            style={{
              height: 46,
              borderRadius: 999,
              overflow: "hidden",
              width: `${(100 * wipe).toFixed(1)}%`,
              background:
                "linear-gradient(90deg, #2E2A24 0%, #2E2A24 26%, #DE5F3B 52%, #E8905C 72%, #6E93CE 100%)",
              boxShadow: "0 6px 30px rgba(0,0,0,0.35)",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            {stops.map((s, i) => {
              const t = easeOut(
                (frame - enterF - (0.25 + i * 0.22) * FPS) / (0.4 * FPS)
              );
              return (
                <div
                  key={s.label}
                  style={{
                    fontFamily: BODY_FONT,
                    fontSize: 34,
                    fontWeight: 600,
                    color: "#FAF6ED",
                    textShadow: "0 1px 12px rgba(0,0,0,0.6)",
                    opacity: t,
                    transform: `translateY(${(10 * (1 - t)).toFixed(1)}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 999,
                      background: s.color,
                      border: "2px solid rgba(250,246,237,0.7)",
                    }}
                  />
                  {s.label}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </>
  );
};

// Segment 20 — end card over the outro two-shot.
export const EndTitle: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const exitF = durationInFrames + 30; // no fade-out; cuts with the shot
  return (
    <>
      <Scrim enterF={4} exitF={exitF} fade={0.4} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 270 }}>
        <BlurIn enterF={5} exitF={exitF}>
          <div style={{ ...titleText, fontSize: 76, fontWeight: 600 }}>
            Open Model Series
          </div>
        </BlurIn>
        <BlurIn enterF={11} exitF={exitF}>
          <div style={{ ...titleText, fontSize: 100, fontWeight: 600, marginTop: 12 }}>
            ep. 3 out soon!
          </div>
        </BlurIn>
      </AbsoluteFill>
    </>
  );
};

// "licenses" card upper-left (the reference parks "Sample" upper-left while the
// speaker keeps talking). Short scrim: it must clear the guest's face. The licenses
// beat spans several micro-spliced segments — entered/exits control whether the
// card animates in (first segment) or out (last segment).
export const LicensesCard: React.FC<{
  durationInFrames: number;
  entered?: boolean;
  exits?: boolean;
}> = ({ durationInFrames, entered, exits }) => {
  const enterF = entered ? -100 : Math.round(0.35 * FPS);
  const exitF = exits ? durationInFrames - Math.round(0.45 * FPS) : durationInFrames + 60;
  return (
    <>
      <Scrim enterF={enterF} exitF={exitF} fade={0.26} />
      <AbsoluteFill>
        <BlurIn
          enterF={enterF}
          exitF={exitF}
          style={{ position: "absolute", left: 92, top: 252 }}
        >
          <div style={{ ...titleText, textAlign: "left", fontSize: 104, fontWeight: 550 }}>
            licenses
          </div>
        </BlurIn>
      </AbsoluteFill>
    </>
  );
};
