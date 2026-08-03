import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getInputProps } from "remotion";
import { BODY_FONT, CREAM_TEXT, EDL, SEG_START_F, segDurF } from "./layout";
import captions from "../captions_edit.json";

// Caption style variants (the editor picks from rendered stills; switch via
// --props='{"captionStyle":"..."}' or by changing DEFAULT_STYLE).
const CAPTION_STYLES = {
  dark: { bg: "rgba(28,24,18,0.62)", text: CREAM_TEXT, blue: "#5B8BF0", orange: "#E8663C", blur: 0 },
  cream: { bg: "rgba(241,236,227,0.94)", text: "#2E2A24", blue: "#3A66DB", orange: "#D9532E", blur: 0 }, // editor pick #2: ink body, blue concepts, orange actions
  creamblue: { bg: "rgba(241,236,227,0.94)", text: "#3E68C8", blue: "#16337E", orange: "#D9532E", blur: 0 },
  whitegrey: { bg: "rgba(255,255,255,0.92)", text: "#4A4640", blue: "#3A66DB", orange: "#D9532E", blur: 0 },
  frost: { bg: "rgba(250,247,240,0.55)", text: "#2E2A24", blue: "#2D50A8", orange: "#C74A28", blur: 14 },
  // plain = no chip over footage (cream text + shadow); falls back to the cream
  // chip over cards, where a backdrop is necessary (editor's note)
  plain: { bg: "transparent", text: "#F2E9D6", blue: "#7FA5F5", orange: "#F0793F", blur: 0 },
  butter: { bg: "rgba(250,246,216,0.96)", text: "#23201B", blue: "#3A66DB", orange: "#3A66DB", blur: 0 },
  // Intro-final: butter TEXT, no background, soft lift shadow; bold-only emphasis
  brandplain: { bg: "transparent", text: "var(--caption-text, #F2E9D6)", blue: "var(--caption-text, #F2E9D6)", orange: "var(--caption-text, #F2E9D6)", blur: 0 },  // wire to the project brand palette
  // brand chip for screen overlays: cream bg + electric blue text
  brandchip: { bg: "rgba(253,249,241,0.96)", text: "#3A66DB", blue: "#3A66DB", orange: "#3A66DB", blur: 0 },
  butterwhite: { bg: "rgba(255,255,255,0.96)", text: "#23201B", blue: "#3A66DB", orange: "#3A66DB", blur: 0 },
} as const;
export type CaptionStyleName = keyof typeof CAPTION_STYLES;
const DEFAULT_STYLE: CaptionStyleName = "butterplain"; // Intro-final: bare butter text; brand chip on overlays

type Word = { text: string; start: number; end: number; it?: number };
type Cue = { start: number; end: number; words: Word[] };
const CUES = captions.cues as Cue[];

// Key-term highlights. Style rule: no bubbles — the term text itself is
// colored ("b" = concept color, "o" = action color, resolved per style).
const PHRASES: [string, string, string][] = [
  ["open", "source", "b"],
  ["open", "weights", "b"],
  ["open", "weight", "b"],
  ["open", "models", "b"],
];
const WORDS: Record<string, string> = {
  license: "b",
  licenses: "b",
  locally: "o",
  spectrum: "o",
  everything: "o",
  control: "o",
};
const norm = (t: string) => t.toLowerCase().replace(/[^a-z]/g, "");

const chipColors = (cue: Cue): (string | null)[] => {
  const out: (string | null)[] = cue.words.map(() => null);
  cue.words.forEach((w, j) => {
    const a = norm(w.text);
    for (const [p1, p2, color] of PHRASES) {
      if (a === p1 && j + 1 < cue.words.length && norm(cue.words[j + 1].text) === p2) {
        out[j] = color;
        out[j + 1] = color;
      }
    }
    if (!out[j] && WORDS[a]) out[j] = WORDS[a];
  });
  return out;
};

// Caption spec: Helvetica, cream, vertically + horizontally centered,
// inside the Reels safe zone. Over floating-card beats the line gets a soft
// dark backdrop so cream text never sits on cream.
export const CaptionsCream: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cue = CUES.find((c) => frame >= c.start && frame < c.end);
  if (!cue) return null;

  const segI = EDL.findIndex(
    (_, i) => frame >= SEG_START_F[i] && frame < SEG_START_F[i] + segDurF(i)
  );
  const framing = segI >= 0 ? EDL[segI].framing : "two";
  // Vertical placement: captions sit JUST ABOVE the speaker's head, centered,
  // wherever geometry allows. Head-top lines per framing: two_title ~1042 (between
  // the paired tags), card beats ~1081 (just under the card). Tight punch-ins have
  // no above-head space — those stay at chest level.
  const centerY =
    framing === "two_title"
      ? 972
      : ["split", "shot", "screenrec", "hold_graphic"].includes(framing)
        ? 1016
        : framing === "primary"
          ? 1090
          : 960;
  const shiftY = centerY - 960;

  const styleName =
    ((getInputProps() as { captionStyle?: CaptionStyleName }).captionStyle ??
      DEFAULT_STYLE) as CaptionStyleName;
  // chips ONLY over the two full-height overlays (code screenshot + dataset
  // recording) — everywhere else captions sit on footage below the cards
  const onCard = ["shot", "screenrec"].includes(framing);
  // chips only where necessary (screen/code overlays + cards): brand cream + blue
  const effective =
    styleName === "plain" && onCard
      ? "cream"
      : (styleName === "butter" || styleName === "butterplain") && onCard
        ? "brandchip"
        : styleName;
  const S = CAPTION_STYLES[effective] ?? CAPTION_STYLES[DEFAULT_STYLE];
  const bare = effective === "plain" || effective === "butterplain";
  const butter = ["butter", "butterwhite", "brandchip", "butterplain"].includes(effective);

  const enter = spring({
    frame: frame - cue.start,
    fps,
    config: { damping: 200, mass: 0.5 },
    durationInFrames: 6,
  });
  const translateY = interpolate(enter, [0, 1], [14, 0]);
  const colors = chipColors(cue);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", paddingTop: 0 }}
    >
      <div
        style={{
          maxWidth: "80%",
          textAlign: "center",
          opacity: enter,
          transform: `translateY(${(translateY + shiftY).toFixed(1)}px)`,
          fontFamily: "CaptionSans, " + BODY_FONT,
          fontWeight: 500,
          fontSize: butter ? 42 : 47,
          lineHeight: 1.28,
          letterSpacing: "0.015em",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px 13px",
          background: S.bg,
          backdropFilter: S.blur ? `blur(${S.blur}px)` : undefined,
          WebkitBackdropFilter: S.blur ? `blur(${S.blur}px)` : undefined,
          borderRadius: butter ? 12 : 16,
          padding: bare ? 0 : butter ? "8px 20px" : "10px 24px",
          boxShadow: butter && !bare ? "0 4px 18px rgba(15,10,5,0.22)" : undefined,
          textShadow: undefined, // pure butter, no shadow at all
        }}
      >
        {cue.words.map((w, j) => {
          const active = frame >= w.start && frame < w.end;
          const hl = colors[j] === "b" ? S.blue : colors[j] === "o" ? S.orange : null;
          return (
            <span
              key={j}
              style={{
                color: hl ?? S.text,
                fontWeight: hl ? (butter ? 700 : 600) : 500,
                fontStyle: w.it ? "italic" : undefined,
                opacity: active ? 1 : hl ? 0.94 : butter ? 0.94 : 0.8,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
