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
import { BRAND } from "./brand";
import { SOURCE_VIDEO } from "./config";

const XFADE = 14; // match BrollTrack crossfade

// Split beat: speaker (top half) + this shot's B-roll (bottom half).
// BOTH panes are CENTERED crops (objectFit cover + objectPosition center) so the
// subject sits centered with an equal top/bottom cut — not one lopsided half.
// Tune the speaker vertical framing with objectPosition's second value only.
const SplitPane: React.FC<{
  file: string;
  from: number;
  durationInFrames: number;
}> = ({ file, from, durationInFrames }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, XFADE], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - XFADE, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* TOP: speaker, centered crop */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "50%", overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile(SOURCE_VIDEO)}
          trimBefore={from}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 90,
            background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.55))",
          }}
        />
      </div>
      {/* BOTTOM: this clip, centered crop */}
      <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: "50%", overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile(file)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}
        />
      </div>
      {/* accent hairline divider */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          width: "100%",
          height: 4,
          transform: "translateY(-2px)",
          background: BRAND.accent,
          boxShadow: `0 0 24px ${BRAND.accent}88`,
        }}
      />
    </AbsoluteFill>
  );
};

export const SplitOverlay: React.FC = () => {
  return (
    <>
      {SHOTS.filter((s) => s.mode === "split").map((s) => {
        const from = Math.round(s.start * FPS) - XFADE;
        const to = Math.round(s.end * FPS);
        return (
          <Sequence key={s.id} from={from} durationInFrames={to - from}>
            <SplitPane file={s.file} from={from} durationInFrames={to - from} />
          </Sequence>
        );
      })}
    </>
  );
};
