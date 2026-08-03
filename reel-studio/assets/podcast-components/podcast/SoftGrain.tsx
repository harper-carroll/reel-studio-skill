import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EDL, SEG_START_F, segDurF } from "./layout";

// Lighter unifier than the template's moody GrainOverlay — this is a bright
// daylight interview with cream graphic panels, so: gentle vignette + fine grain.
// Skipped entirely on the title-split open: animated grain over the flat cream
// panel read as the title "shaking".
export const SoftGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 12;
  const segI = EDL.findIndex(
    (_, i) => frame >= SEG_START_F[i] && frame < SEG_START_F[i] + segDurF(i)
  );
  if (segI >= 0 && EDL[segI].framing === "title_split") return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(135% 95% at 50% 45%, transparent 68%, rgba(10,10,14,0.16) 100%)",
        }}
      />
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.055 }}
      >
        <filter id="softgrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#softgrain)" />
      </svg>
    </AbsoluteFill>
  );
};
