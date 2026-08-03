import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import {
  BODY_FONT,
  CARD_FONT,
  PINK,
  TITLE_FONT,
  CREAM_PANEL,
  INK,
  ORANGE,
  BLUE,
  GREEN,
  MUTED,
  PANEL_H,
  FPS,
  relF,
} from "./layout";

// ---------------------------------------------------------------------------
// Explanatory-graphics system (cream UI panels like the reference reel).
// Each graphic knows WHAT to reveal and WHERE to zoom at WHICH word, via
// keyframes given in source-seconds (converted with relF against its segment).
// ---------------------------------------------------------------------------

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export type CamKey = { t: number; z: number; x: number; y: number };

// Piecewise-eased camera over keyframes; x/y = panel-space point to center.
const useCamera = (segIndex: number, keys: CamKey[]) => {
  const frame = useCurrentFrame();
  const kf = keys.map((k) => ({ ...k, f: relF(segIndex, k.t) }));
  let a = kf[0];
  let b = kf[kf.length - 1];
  for (let i = 0; i < kf.length - 1; i++) {
    if (frame >= kf[i].f && frame <= kf[i + 1].f) {
      a = kf[i];
      b = kf[i + 1];
      break;
    }
  }
  if (frame < kf[0].f) b = a = kf[0];
  if (frame > kf[kf.length - 1].f) a = b = kf[kf.length - 1];
  const p = a.f === b.f ? 1 : easeInOut((frame - a.f) / (b.f - a.f));
  const z = a.z + (b.z - a.z) * p;
  const x = a.x + (b.x - a.x) * p;
  const y = a.y + (b.y - a.y) * p;
  return { z, x, y };
};

// The camera-driven graphic, rendered as a FLOATING rounded card over the
// footage (the reference episode's screen-recording-card look): warm-gradient
// cream, soft drop shadow, gentle scale-in. Content still authors in a
// 1080x1056 space; the card scales it to 0.85.
const CARD_SCALE = 0.85;
export const Panel: React.FC<{
  segIndex: number;
  cam: CamKey[];
  entered?: boolean; // true when continuing across a micro-splice — no re-entry
  h?: number; // content-space height — fit the card to its content (no empty bottoms)
  children: React.ReactNode;
}> = ({ segIndex, cam, entered, h = PANEL_H, children }) => {
  const { z, x, y } = useCamera(segIndex, cam);
  const frame = useCurrentFrame();
  const enterSpring = spring({
    frame,
    fps: FPS,
    config: { damping: 16, mass: 0.7, stiffness: 120 },
  });
  const enter = entered ? 1 : enterSpring;
  return (
    <div
      style={{
        position: "absolute",
        left: 81,
        top: 130,
        width: 1080 * CARD_SCALE,
        height: h * CARD_SCALE,
        overflow: "hidden",
        borderRadius: 26,
        background: CREAM_PANEL,
        boxShadow: "0 26px 70px rgba(35,24,12,0.38), 0 4px 16px rgba(35,24,12,0.22)",
        opacity: enter,
        transform: `scale(${(0.94 + 0.06 * enter).toFixed(3)})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 1080,
          height: PANEL_H,
          transformOrigin: "0 0",
          transform: `scale(${CARD_SCALE}) translate(${(540 - x * z).toFixed(1)}px, ${(h / 2 - y * z).toFixed(1)}px) scale(${z.toFixed(4)})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// spring pop-in for rows/chips/marks at a word-timed frame
export const usePop = (atF: number) => {
  const frame = useCurrentFrame();
  const s = spring({
    frame: frame - atF,
    fps: FPS,
    config: { damping: 13, mass: 0.6, stiffness: 160 },
  });
  return { scale: 0.7 + 0.3 * s, opacity: frame >= atF ? s : 0 };
};

const Mark: React.FC<{ ok: boolean; atF: number }> = ({ ok, atF }) => {
  const { scale, opacity } = usePop(atF);
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 999,
        background: ok ? BLUE : ORANGE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale.toFixed(3)})`,
        opacity,
      }}
    >
      <svg width="34" height="34" viewBox="0 0 34 34">
        {ok ? (
          <path
            d="M6 18 L14 26 L28 8"
            stroke="#F6F1E6"
            strokeWidth="4.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M8 8 L26 26 M26 8 L8 26"
            stroke="#F6F1E6"
            strokeWidth="4.6"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};

const Row: React.FC<{
  y: number;
  label: string;
  ok: boolean;
  atF: number;
  enterF: number;
}> = ({ y, label, ok, atF, enterF }) => {
  const { opacity } = usePop(enterF);
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 30,
        opacity,
      }}
    >
      <Mark ok={ok} atF={atF} />
      <div
        style={{
          fontFamily: CARD_FONT,
          fontSize: 54,
          fontWeight: 600,
          color: INK,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const PanelTitle: React.FC<{ text: string; y?: number; atF?: number }> = ({
  text,
  y = 158,
  atF = 0,
}) => {
  const { opacity } = usePop(atF);
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: y,
        fontFamily: CARD_FONT,
        fontSize: 64,
        fontWeight: 700,
        color: INK,
        opacity,
      }}
    >
      {text}
    </div>
  );
};

const Badge: React.FC<{
  y: number;
  text: string;
  sub?: string;
  color: string;
  atF: number;
  subAtF?: number;
}> = ({ y, text, sub, color, atF, subAtF }) => {
  const { scale, opacity } = usePop(atF);
  const subPop = usePop(subAtF ?? atF);
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 30,
      }}
    >
      <div
        style={{
          background: color,
          color: "#F6F1E6",
          fontFamily: CARD_FONT,
          fontWeight: 700,
          fontSize: 46,
          letterSpacing: "0.06em",
          padding: "20px 38px",
          borderRadius: 16,
          transform: `scale(${scale.toFixed(3)})`,
          transformOrigin: "left center",
          opacity,
        }}
      >
        {text}
      </div>
      {sub ? (
        <div
          style={{
            fontFamily: BODY_FONT,
            fontSize: 42,
            fontWeight: 500,
            color: MUTED,
            opacity: subPop.opacity,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

// --- G1: "what gets released?" — weights/code yes, data/training-code no -----
export const GReleased: React.FC<{ segIndex: number; entered?: boolean }> = ({ segIndex, entered }) => {
  const r = (t: number) => relF(segIndex, t);
  return (
    <Panel
      segIndex={segIndex}
      entered={entered}
      h={950}
      cam={[
        { t: 39.5, z: 1, x: 540, y: 475 },
        { t: 40.3, z: 1.26, x: 540, y: 355 },
        { t: 42.3, z: 1.26, x: 540, y: 575 },
        { t: 43.7, z: 1.0, x: 540, y: 475 },
        { t: 45.6, z: 1.14, x: 505, y: 770 },
      ]}
    >
      <PanelTitle text="what gets released?" />
      <Row y={288} label="weights" ok atF={r(40.55)} enterF={r(39.1)} />
      <Row y={403} label="model code" ok atF={r(41.19)} enterF={r(39.25)} />
      <Row y={518} label="training data" ok={false} atF={r(42.81)} enterF={r(39.4)} />
      <Row y={633} label="training code" ok={false} atF={r(43.37)} enterF={r(39.55)} />
      <Badge
        y={768}
        text="OPEN WEIGHT"
        sub="≠ fully open source"
        color={ORANGE}
        atF={r(44.0)}
        subAtF={r(45.75)}
      />
    </Panel>
  );
};

// --- G2: "some labs, e.g." — real NVIDIA / Ai2 logos on white cards ---------
export const GFullyOpen: React.FC<{ segIndex: number; entered?: boolean }> = ({ segIndex, entered }) => {
  const r = (t: number) => relF(segIndex, t);
  const logoBox: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const c1 = usePop(r(53.16));
  const c2 = usePop(r(53.95));
  const rel = usePop(r(54.6));
  const ev = usePop(r(55.12));
  // Reading order: "some labs, e.g." / [logos] / "release" / "everything."
  return (
    <Panel
      segIndex={segIndex}
      entered={entered}
      h={800}
      cam={[
        { t: 52.76, z: 1, x: 540, y: 400 },
        { t: 55.8, z: 1.06, x: 540, y: 398 },
      ]}
    >
      <PanelTitle text="some labs, e.g." y={148} />
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 252,
          display: "flex",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div style={{ ...logoBox, transform: `scale(${c1.scale.toFixed(3)})`, opacity: c1.opacity }}>
          <Img src={staticFile("broll/logo_nvidia.png")} style={{ height: 112, objectFit: "contain" }} />
        </div>
        <div style={{ ...logoBox, transform: `scale(${c2.scale.toFixed(3)})`, opacity: c2.opacity }}>
          <Img src={staticFile("broll/logo_ai2.png")} style={{ height: 122, objectFit: "contain" }} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 424,
          fontFamily: CARD_FONT,
          fontSize: 60,
          fontWeight: 600,
          color: INK,
          opacity: rel.opacity,
        }}
      >
        release
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 512,
          fontFamily: CARD_FONT,
          fontSize: 140,
          fontWeight: 800,
          color: ORANGE,
          opacity: ev.opacity,
          transform: `scale(${ev.scale.toFixed(3)})`,
          transformOrigin: "left center",
        }}
      >
        everything.
      </div>
    </Panel>
  );
};

// --- G2b: the everything-checklist ticking item by item ---------------------
export const GFullyOpen2: React.FC<{ segIndex: number; entered?: boolean }> = ({ segIndex, entered }) => {
  const r = (t: number) => relF(segIndex, t);
  return (
    <Panel
      segIndex={segIndex}
      entered={entered}
      h={950}
      cam={[
        { t: 63.95, z: 1.2, x: 540, y: 330 },
        { t: 65.9, z: 1.2, x: 540, y: 490 },
        { t: 66.9, z: 1.2, x: 540, y: 605 },
        { t: 67.55, z: 1.0, x: 540, y: 475 },
      ]}
    >
      <PanelTitle text="fully open means" />
      <Row y={288} label="data" ok atF={r(64.26)} enterF={0} />
      <Row y={403} label="training scripts" ok atF={r(64.96)} enterF={0} />
      <Row y={518} label="weights" ok atF={r(65.94)} enterF={0} />
      <Row y={633} label="eval logs" ok atF={r(66.7)} enterF={0} />
      <Badge y={768} text="FULLY OPEN SOURCE" color={BLUE} atF={r(67.25)} />
    </Panel>
  );
};

// --- G3: model code -> architecture ----------------------------------------
export const GArch: React.FC<{ segIndex: number; entered?: boolean }> = ({ segIndex, entered }) => {
  const r = (t: number) => relF(segIndex, t);
  const file = usePop(r(107.7));
  const blocks = [
    { label: "embeddings", at: 108.6 },
    { label: "attention × N", at: 109.3 },
    { label: "mlp", at: 110.0 },
    { label: "lm head", at: 110.6 },
  ];
  const pops = [usePop(r(blocks[0].at)), usePop(r(blocks[1].at)), usePop(r(blocks[2].at)), usePop(r(blocks[3].at))];
  return (
    <Panel
      segIndex={segIndex}
      entered={entered}
      h={800}
      cam={[
        { t: 107.35, z: 1, x: 540, y: 400 },
        { t: 110.4, z: 1.28, x: 740, y: 470 },
        { t: 112.55, z: 1.32, x: 740, y: 470 },
      ]}
    >
      <PanelTitle text="the code shows the shape" />
      {/* file card */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 300,
          width: 330,
          height: 440,
          background: "#FBF8F1",
          border: `3px solid ${INK}22`,
          borderRadius: 20,
          opacity: file.opacity,
          padding: 28,
        }}
      >
        <div style={{ fontFamily: "Menlo, monospace", fontSize: 30, color: INK, marginBottom: 24 }}>
          modeling.py
        </div>
        {[210, 250, 160, 230, 120, 200, 180].map((w, i) => (
          <div
            key={i}
            style={{
              width: w,
              height: 14,
              borderRadius: 7,
              background: i % 3 === 1 ? `${ORANGE}66` : `${INK}22`,
              marginBottom: 20,
            }}
          />
        ))}
      </div>
      {/* arrow */}
      <svg
        width="90"
        height="60"
        viewBox="0 0 90 60"
        style={{ position: "absolute", left: 470, top: 490, opacity: file.opacity }}
      >
        <path d="M4 30 H70 M52 12 L74 30 L52 48" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
      </svg>
      {/* architecture stack — decoder-only transformer, drawn CORRECTLY:
          the × N repeats the (attention + mlp) block pair, not attention alone */}
      {(() => {
        const box = (
          label: string,
          top: number,
          pop: { scale: number; opacity: number },
          hot?: boolean
        ) => (
          <div
            key={label}
            style={{
              position: "absolute",
              left: 610,
              top,
              width: 280,
              height: 84,
              borderRadius: 16,
              background: hot ? ORANGE : "#FBF8F1",
              border: `3px solid ${hot ? ORANGE : `${INK}33`}`,
              color: hot ? "#F6F1E6" : INK,
              fontFamily: CARD_FONT,
              fontWeight: 650,
              fontSize: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${pop.scale.toFixed(3)})`,
              opacity: pop.opacity,
            }}
          >
            {label}
          </div>
        );
        return (
          <>
            {box("embeddings", 262, pops[0])}
            {/* repeated block: attention + mlp, bracketed with × N */}
            <div
              style={{
                position: "absolute",
                left: 588,
                top: 372,
                width: 324,
                height: 226,
                borderRadius: 22,
                border: `3px dashed ${ORANGE}`,
                opacity: pops[1].opacity,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 926,
                top: 462,
                fontFamily: BODY_FONT,
                fontWeight: 700,
                fontSize: 40,
                color: ORANGE,
                opacity: pops[1].opacity,
              }}
            >
              ×N
            </div>
            {box("attention", 392, pops[1], true)}
            {box("mlp", 494, pops[2])}
            {box("lm head", 628, pops[3])}
          </>
        );
      })()}
    </Panel>
  );
};
