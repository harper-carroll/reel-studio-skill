import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND, FONT } from "./brand";
import captions from "./captions.json";

type Word = { text: string; start: number; end: number };
type Cue = { start: number; end: number; words: Word[] };
const CUES = captions.cues as Cue[];

// Short phrase captions (default 3-4 words), natural/proper case, active word
// accented. Timings come from scripts/align_words.py (faster-whisper forced
// alignment) — real word sync, not interpolation.
//
// Want ONE word at a time instead? Set MAX_WORDS = 1 in align_words.py and render
// each cue's single word. Want all-caps? add textTransform: "uppercase" below.
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cue = CUES.find((c) => frame >= c.start && frame < c.end);
  if (!cue) return null;

  const enter = spring({
    frame: frame - cue.start,
    fps,
    config: { damping: 200, mass: 0.5 },
    durationInFrames: 7,
  });
  const translateY = interpolate(enter, [0, 1], [22, 0]);

  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 470 }}
    >
      <div
        style={{
          maxWidth: "84%",
          textAlign: "center",
          opacity: enter,
          transform: `translateY(${translateY}px)`,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 66,
          lineHeight: 1.16,
          letterSpacing: "-0.5px",
          textShadow: "0 2px 20px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 16px",
        }}
      >
        {cue.words.map((w, i) => {
          const active = frame >= w.start && frame < w.end;
          return (
            <span key={i} style={{ color: active ? BRAND.accent : BRAND.text }}>
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
