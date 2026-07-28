import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { SHOTS, FPS } from "./shots";

const XFADE = 14; // crossfade frames between clips
// Each clip is generated at least as long as its display window (+crossfade lead),
// so we trim rather than slow — playback stays 1:1.

// A single full-frame B-roll clip with fade in/out and a slow Ken Burns push.
const Clip: React.FC<{
  file: string;
  durationInFrames: number;
  push: "in" | "out" | "up";
  isFirst: boolean;
  isLast: boolean;
}> = ({ file, durationInFrames, push, isFirst, isLast }) => {
  const frame = useCurrentFrame();
  const fadeIn = isFirst ? 1 : interpolate(frame, [0, XFADE], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = isLast
    ? 1
    : interpolate(
        frame,
        [durationInFrames - XFADE, durationInFrames],
        [1, 0],
        { extrapolateLeft: "clamp" }
      );
  const opacity = Math.min(fadeIn, fadeOut);

  const p = interpolate(frame, [0, durationInFrames], [0, 1]);
  let scale = 1;
  let ty = 0;
  if (push === "in") scale = interpolate(p, [0, 1], [1.02, 1.12]);
  if (push === "out") scale = interpolate(p, [0, 1], [1.12, 1.02]);
  if (push === "up") {
    scale = interpolate(p, [0, 1], [1.08, 1.14]);
    ty = interpolate(p, [0, 1], [2, -2]);
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo
        src={staticFile(file)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateY(${ty}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Full-frame B-roll for the entire timeline. Clips overlap by XFADE for crossfades.
export const BrollTrack: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0E16" }}>
      {/* Full-frame shots only; split shots are drawn by SplitOverlay (both panes). */}
      {SHOTS.filter((s) => s.mode === "full").map((s) => {
        const isFirst = s.start === 0;
        const isLast = s.id === SHOTS[SHOTS.length - 1].id;
        const from = Math.round(s.start * FPS) - (isFirst ? 0 : XFADE);
        const to = Math.round(s.end * FPS);
        const duration = to - from;
        return (
          <Sequence key={s.id} from={from} durationInFrames={duration}>
            <Clip
              file={s.file}
              durationInFrames={duration}
              push={s.push}
              isFirst={isFirst}
              isLast={isLast}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
