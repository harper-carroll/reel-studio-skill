import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  BODY_FONT,
  CARD_FONT,
  PINK,
  TITLE_FONT,
  INK,
  ORANGE,
  GREEN,
  MUTED,
  FPS,
  relF,
} from "./layout";
import { Panel, usePop } from "./graphics";
import { GReleased, GFullyOpen, GFullyOpen2, GArch } from "./graphics";

// --- G4: licenses — host publicly vs run locally ----------------------------
const PathCard: React.FC<{
  x: number;
  glyph: "cloud" | "laptop";
  label: string;
  sub: string;
  atF: number;
  hotAtF?: number;
}> = ({ x, glyph, label, sub, atF, hotAtF }) => {
  const { scale, opacity } = usePop(atF);
  const frame = useCurrentFrame();
  const hot = hotAtF !== undefined && frame >= hotAtF;
  const hotPop = usePop(hotAtF ?? 1e9);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 310,
        width: 420,
        height: 470,
        borderRadius: 24,
        background: "#FBF8F1",
        border: `4px solid ${hot ? ORANGE : `${INK}22`}`,
        boxShadow: hot ? `0 0 0 ${(8 * hotPop.opacity).toFixed(1)}px ${ORANGE}33` : "none",
        transform: `scale(${(scale * (hot ? 1.03 : 1)).toFixed(3)})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 58,
      }}
    >
      <svg width="150" height="120" viewBox="0 0 150 120">
        {glyph === "cloud" ? (
          <path
            d="M40 88 a26 26 0 1 1 6 -51 a32 32 0 0 1 61 8 a22 22 0 0 1 -4 43 z"
            fill="none"
            stroke={INK}
            strokeWidth="6"
            strokeLinejoin="round"
          />
        ) : (
          <g fill="none" stroke={INK} strokeWidth="6" strokeLinejoin="round">
            <rect x="30" y="22" width="90" height="58" rx="6" />
            <path d="M18 96 h114 l-12 -16 h-90 z" />
          </g>
        )}
      </svg>
      <div style={{ fontFamily: CARD_FONT, fontSize: 44, fontWeight: 700, color: INK, marginTop: 26 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: CARD_FONT,
          fontSize: 34,
          fontWeight: 500,
          color: hot ? ORANGE : MUTED,
          marginTop: 14,
        }}
      >
        {sub}
      </div>
    </div>
  );
};

export const GLicense: React.FC<{ segIndex: number; entered?: boolean }> = ({ segIndex, entered }) => {
  const r = (t: number) => relF(segIndex, t);
  return (
    <Panel
      segIndex={segIndex}
      entered={entered}
      h={860}
      cam={[
        { t: 149.1, z: 1, x: 540, y: 430 },
        { t: 151.9, z: 1, x: 540, y: 430 },
        { t: 152.9, z: 1.22, x: 760, y: 520 },
        { t: 155.3, z: 1.25, x: 760, y: 520 },
      ]}
    >
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 168,
          fontFamily: CARD_FONT,
          fontSize: 64,
          fontWeight: 700,
          color: INK,
        }}
      >
        where will it run?
      </div>
      <PathCard x={110} glyph="cloud" label="host it publicly" sub="license applies" atF={r(149.7)} />
      <PathCard
        x={560}
        glyph="laptop"
        label="run it locally"
        sub="no license worries"
        atF={r(150.6)}
        hotAtF={r(151.95)}
      />
    </Panel>
  );
};

// --- G5: open source = control ----------------------------------------------
const Benefit: React.FC<{ y: number; label: string; atF: number }> = ({ y, label, atF }) => {
  const { scale, opacity } = usePop(atF);
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 28,
        opacity,
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 999,
          background: PINK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${scale.toFixed(3)})`,
        }}
      >
        <svg width="30" height="30" viewBox="0 0 34 34">
          <path
            d="M6 18 L14 26 L28 8"
            stroke="#3A66DB"
            strokeWidth="4.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={{ fontFamily: CARD_FONT, fontSize: 52, fontWeight: 600, color: INK }}>{label}</div>
    </div>
  );
};

export const GBenefits: React.FC<{ segIndex: number; entered?: boolean }> = ({ segIndex, entered }) => {
  const r = (t: number) => relF(segIndex, t);
  const head = usePop(r(158.7));
  return (
    <Panel
      segIndex={segIndex}
      entered={entered}
      h={880}
      cam={[
        { t: 157.0, z: 1, x: 540, y: 440 },
        { t: 168.9, z: 1, x: 540, y: 440 },
        { t: 169.9, z: 1.24, x: 560, y: 640 },
        { t: 171.1, z: 1.24, x: 560, y: 640 },
        { t: 171.75, z: 1.12, x: 550, y: 560 },
      ]}
    >
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 190,
          width: 860,
          fontFamily: CARD_FONT,
          fontSize: 78,
          fontWeight: 700,
          color: INK,
          lineHeight: 1.05,
          opacity: head.opacity,
        }}
      >
        control, back in your hands
      </div>
      <Benefit y={470} label="host it commercially" atF={r(161.4)} />
      <Benefit y={600} label="customize it for your use case" atF={r(164.45)} />
      <Benefit y={730} label="inspect the training data" atF={r(167.9)} />
    </Panel>
  );
};

// --- G6: the one-line-of-code terminal ---------------------------------------
export const GTerminal: React.FC<{ segIndex: number; entered?: boolean }> = ({ segIndex, entered }) => {
  const r = (t: number) => relF(segIndex, t);
  const frame = useCurrentFrame();
  const head = usePop(r(189.0));
  const term = usePop(r(190.4));
  const foot = usePop(r(194.2));
  const text = "llama-server -hf bartowski/Meta-Llama-3.1-8B-Instruct-GGUF:Q4_K_M";
  const chars = Math.floor(
    interpolate(frame, [r(191.5), r(193.4)], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const cursorOn = Math.floor(frame / (FPS * 0.45)) % 2 === 0;
  return (
    <Panel
      segIndex={segIndex}
      entered={entered}
      h={930}
      cam={[
        { t: 187.6, z: 1, x: 540, y: 465 },
        { t: 195.55, z: 1.06, x: 540, y: 472 },
      ]}
    >
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 180,
          fontFamily: CARD_FONT,
          fontSize: 70,
          fontWeight: 700,
          color: INK,
          opacity: head.opacity,
        }}
      >
        run LLMs locally
      </div>
      {/* terminal card */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 350,
          width: 860,
          height: 400,
          borderRadius: 22,
          background: "#191713",
          opacity: term.opacity,
          padding: "30px 40px",
        }}
      >
        <div style={{ display: "flex", gap: 14, marginBottom: 40 }}>
          {[ORANGE, "#E2B93B", GREEN].map((c) => (
            <div key={c} style={{ width: 22, height: 22, borderRadius: 999, background: c }} />
          ))}
        </div>
        <div
          style={{
            fontFamily: "Menlo, monospace",
            fontSize: 30,
            lineHeight: 1.6,
            color: "#F1ECE3",
            wordBreak: "break-all",
          }}
        >
          <span style={{ color: "#7FA5F5", marginRight: 18 }}>$</span>
          <span>{text.slice(0, chars)}</span>
          <span
            style={{
              display: "inline-block",
              width: 18,
              height: 36,
              marginLeft: 6,
              verticalAlign: "-6px",
              background: cursorOn ? "#F1ECE3" : "transparent",
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 800,
          fontFamily: BODY_FONT,
          fontSize: 40,
          fontWeight: 500,
          color: MUTED,
          opacity: foot.opacity,
        }}
      >
        how? stay tuned →
      </div>
    </Panel>
  );
};

// registry used by the composition
export const GRAPHICS: Record<string, React.FC<{ segIndex: number; entered?: boolean }>> = {
  released: GReleased,
  fullyopen: GFullyOpen,
  fullyopen2: GFullyOpen2,
  arch: GArch,
  license: GLicense,
  benefits: GBenefits,
  terminal: GTerminal,
};
