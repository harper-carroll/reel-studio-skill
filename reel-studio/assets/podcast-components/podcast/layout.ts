import edlJson from "../edl.json";

// Composition + source geometry
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const SPEAKER_SRC = "source/speaker_blue.mp4"; // blue-wall composite (59% slate)
export const SRC_W = 1620; // speaker.mp4 dimensions
export const SRC_H = 2880;
export const PANEL_H = 1056; // graphics panel = top 55% on split beats
export const PANE_H = H - PANEL_H; // speaker pane below the panel

export type Framing =
  | "two"
  | "two_title"
  | "title_split"
  | "primary"
  | "primary_title"
  | "guest"
  | "guest_title"
  | "guest2"
  | "split"
  | "broll"
  | "shot"
  | "screenrec"
  | "hold_graphic";
export type Seg = {
  id: number;
  in: number;
  out: number;
  framing: Framing;
  speaker: "primary" | "guest";
  graphic?: string;
  title?: string;
  paneZoom?: number;
  file?: string;
  trim?: number;
  rate?: number; // playback speed (e.g. bump guest sections 1.1x for pace)
};

// title_split: cream title panel over a two-shot pane below
export const TITLE_PANEL_H = 1000;

export const EDL = (edlJson as { segments: Seg[] }).segments;

const rnd = (x: number) => Math.round(x);

// cumulative output start frame per segment (mirrors build_edit_captions.py);
// a segment's output duration = source duration / rate
export const SEG_START_F: number[] = (() => {
  const out: number[] = [];
  let cum = 0;
  for (const e of EDL) {
    out.push(rnd(cum * FPS));
    cum += (e.out - e.in) / (e.rate ?? 1);
  }
  return out;
})();

export const TOTAL_F = (() => {
  let cum = 0;
  for (const e of EDL) cum += (e.out - e.in) / (e.rate ?? 1);
  return rnd(cum * FPS);
})();

export const segDurF = (i: number) =>
  (i + 1 < EDL.length ? SEG_START_F[i + 1] : TOTAL_F) - SEG_START_F[i];

// source-seconds -> frames relative to a segment's own sequence (rate-aware)
export const relF = (segIndex: number, srcT: number) =>
  rnd(((srcT - EDL[segIndex].in) * FPS) / (EDL[segIndex].rate ?? 1));

// Face anchor points in speaker.mp4 pixel space (measured on gridded frames).
// Eye lines: primary speaker ~1400, guest ~1590; the table top is ~2160 — anchors are
// chosen to keep the table under ~25% of frame. *_title framings keep faces
// lower so titles own the wall space; card framings show the face below the
// floating graphic card. twoTitle is STATIC (no Ken Burns) so the name-tag
// arrow stays locked to the speaker's head.
export const ANCHOR = {
  twoPane: { x: 780, y: 1590 },
  twoTitle: { x: 785, y: 1135 },
  two: { x: 780, y: 1730 },
  primaryTitle: { x: 1110, y: 1739 },
  primary: { x: 1110, y: 1800 },
  primaryCard: { x: 1160, y: 1127 },
  guestTitle: { x: 490, y: 1842 },
  guest: { x: 456, y: 2022 },
  guestCard: { x: 465, y: 1297 },
  guest2: { x: 456, y: 1855 },
} as const;

// Reels safe zone (1080x1920): UI covers ~110px top, ~320px bottom, 60px left,
// 120px right. All text overlays must live inside x 60-960, y 250-1600.
export const SAFE = { top: 250, bottom: 1600, left: 60, right: 960 } as const;

// Palette for the cream explanatory panels (matched to the reference reel)
export const INK = "#2E2A24";
export const CREAM_PANEL = "#F5EFE3"; // placeholder cream — override from brand.ts
export const CREAM_TEXT = "#F2E9D6"; // caption cream
export const ORANGE = "#D97706"; // placeholder warm accent — override from brand.ts
export const BLUE = "#3A66DB"; // placeholder accent — override from brand.ts
export const GUEST_ACCENT = "#F0B8E5"; // placeholder guest-side accent — override from brand.ts
export const GREEN = "#3E7C56";
export const MUTED = "#8A8478";
export const TITLE_FONT = "TitleSerif, 'Didot', 'Bodoni 72', serif";
export const BODY_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
export const CARD_FONT = "CaptionSans, 'Helvetica Neue', Helvetica, sans-serif"; // brand sans-serif — file loaded as caption-sans.otf
