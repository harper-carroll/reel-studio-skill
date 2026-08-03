import React from "react";
import {
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { SPEAKER_SRC, SRC_W, SRC_H, W } from "./layout";

// Renders speaker.mp4 cropped around a source-space anchor point at a given zoom,
// inside a viewport of viewW x viewH. zoom is relative to "full source width fits
// the comp width" (scale 2/3 at zoom 1). A slow Ken Burns push (z0 -> z1 over the
// segment) keeps static shots alive. The crop is clamped so source edges never show.
export const SpeakerView: React.FC<{
  trimBefore: number; // source frames
  anchor: { x: number; y: number };
  z0: number;
  z1: number;
  durationInFrames: number;
  viewW?: number;
  viewH?: number;
  rate?: number;
}> = ({ trimBefore, anchor, z0, z1, durationInFrames, viewW = 1080, viewH = 1920, rate = 1 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const zoom = z0 + (z1 - z0) * p;
  const s = (W / SRC_W) * zoom;

  let left = viewW / 2 - anchor.x * s;
  let top = viewH / 2 - anchor.y * s;
  // clamp: never reveal past the source edges
  left = Math.min(0, Math.max(viewW - SRC_W * s, left));
  top = Math.min(0, Math.max(viewH - SRC_H * s, top));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: "#101010",
      }}
    >
      <OffthreadVideo
        src={staticFile(SPEAKER_SRC)}
        trimBefore={trimBefore}
        playbackRate={rate}
        muted
        style={{
          position: "absolute",
          width: SRC_W * s,
          height: SRC_H * s,
          left,
          top,
          // anti-drab grade: lift saturation + contrast on the washed-out source
          filter: "saturate(1.18) contrast(1.07) brightness(1.03)",
        }}
      />
      {/* warm cast — the room reads cold; this pulls it toward the cozy
          window-light look of the reference episodes */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(200deg, rgba(255,176,96,0.14) 0%, rgba(255,150,80,0.07) 45%, rgba(255,120,60,0.05) 100%)",
          mixBlendMode: "soft-light",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
