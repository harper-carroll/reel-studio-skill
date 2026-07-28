import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

// Filmic unifier over everything: animated grain + vignette. Ties the Veo clips
// and the source footage into one moody, analog look.
export const GrainOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 12; // re-roll grain a few times a second

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 80% at 50% 42%, transparent 55%, rgba(5,8,14,0.55) 100%)",
        }}
      />
      {/* film grain */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "overlay",
          opacity: 0.08,
        }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
