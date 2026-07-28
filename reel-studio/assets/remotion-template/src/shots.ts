// THE SHOT LIST — the skill replaces SHOTS[] with the chosen style's shot list.
//
// Each shot:
//  - start/end : DISPLAY seconds on the final timeline. Keep them CONTIGUOUS
//    (each shot's end === the next shot's start) so there are no gaps; the last
//    end === the audio duration.
//  - mode      : "full" = B-roll fills the frame. "split" = speaker (source video)
//    on the top half, this shot's B-roll on the bottom half — both centered crops.
//  - push      : slow Ken Burns move ("in" | "out" | "up") for full-frame shots.
//  - file      : the clip under public/. Use "source/speaker.mp4" for a full-frame
//    talking-head beat (e.g. the opener); otherwise "broll/clipN.mp4".
//  - prompt    : the generation prompt (kept here for reference/regeneration).
//
// GENERATION RULE: make each clip at least as long as its window + ~0.5s crossfade
// lead, so the editor TRIMS rather than freezes or slows. (6s window -> ask for 7s.)
export type ShotMode = "full" | "split";
export interface Shot {
  id: number;
  file: string;
  start: number;
  end: number;
  mode: ShotMode;
  push: "in" | "out" | "up";
  prompt: string;
}

// One shared style block appended to every prompt keeps 10 varied clips feeling
// like one film. The skill writes this from the style the user chose.
const STYLE =
  "Vertical 9:16 cinematic, painterly. <PALETTE + LIGHT + TEXTURE + MOTION from the chosen style>. " +
  "No on-screen text, no captions, no words, no watermark.";

// Example structure (replaced by the real shot list). Windows must be contiguous.
export const SHOTS: Shot[] = [
  {
    id: 1,
    file: "source/speaker.mp4", // full-frame speaker opener
    start: 0,
    end: 6,
    mode: "full",
    push: "in",
    prompt: "(speaker source — not generated)",
  },
  {
    id: 2,
    file: "broll/clip2.mp4",
    start: 6,
    end: 12,
    mode: "split", // speaker top + this B-roll bottom
    push: "out",
    prompt: "<extensive per-clip prompt in the chosen style>. " + STYLE,
  },
  {
    id: 3,
    file: "broll/clip3.mp4",
    start: 12,
    end: 18,
    mode: "full",
    push: "in",
    prompt: "<extensive per-clip prompt in the chosen style>. " + STYLE,
  },
];

// Composition constants. The skill sets TOTAL_SECONDS to the audio duration and
// picks WIDTH/HEIGHT from the chosen aspect ratio (9:16 vertical by default).
export const FPS = 30;
export const TOTAL_SECONDS = 18; // = audio length; drives duration
export const WIDTH = 1080;
export const HEIGHT = 1920;
