import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { BrollTrack } from "./BrollTrack";
import { SplitOverlay } from "./SplitOverlay";
import { GrainOverlay } from "./GrainOverlay";
import { Captions } from "./Captions";
import { loadBrandFonts } from "./fonts";
import { AUDIO } from "./config";

// Layer order (bottom -> top):
// 1. full-frame B-roll (crossfading, Ken Burns)
// 2. split-screen beats (speaker top / B-roll bottom, both centered crops)
// 3. filmic grain + vignette unifier
// 4. word-synced captions
// 5. the original spoken audio
export const Reel: React.FC = () => {
  // Load fonts INSIDE the composition component (not at module top level) — a
  // top-level delayRender() fires during Remotion's composition-listing phase and
  // throws on a full render.
  loadBrandFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0E16" }}>
      <BrollTrack />
      <SplitOverlay />
      <GrainOverlay />
      <Captions />
      <Audio src={staticFile(AUDIO)} />
    </AbsoluteFill>
  );
};
