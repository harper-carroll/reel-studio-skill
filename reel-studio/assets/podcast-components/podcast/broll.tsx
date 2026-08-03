import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FPS } from "./layout";
import { SpeakerView } from "./SpeakerView";

// Full-screen generated B-roll clip with the same warm grade as the footage
// and a slow push, so it sits inside the film.
export const BrollView: React.FC<{
  file: string;
  trim?: number;
  durationInFrames: number;
}> = ({ file, trim = 0, durationInFrames }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = 1.04 + 0.06 * p;
  return (
    <AbsoluteFill style={{ backgroundColor: "#161310", overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(file)}
        trimBefore={Math.round(trim * FPS)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale.toFixed(3)})`,
          filter: "saturate(1.1) contrast(1.04)",
        }}
      />
    </AbsoluteFill>
  );
};

// Dimmed, blurred speaker behind a floating media card (ep02's phone-card look).
const DimmedSpeaker: React.FC<{
  trimBefore: number;
  anchor: { x: number; y: number };
  durationInFrames: number;
  rate?: number;
}> = ({ trimBefore, anchor, durationInFrames, rate }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", inset: 0, filter: "blur(7px)" }}>
      <SpeakerView
        trimBefore={trimBefore}
        anchor={anchor}
        z0={1.76}
        z1={1.8}
        durationInFrames={durationInFrames}
        rate={rate}
      />
    </div>
    <AbsoluteFill style={{ background: "rgba(18,14,10,0.42)" }} />
  </AbsoluteFill>
);

const cardShadow = "0 26px 70px rgba(15,10,5,0.5), 0 4px 16px rgba(15,10,5,0.3)";

// A real screenshot (e.g. model architecture code) in a floating card with a
// slow Ken Burns push, over the dimmed speaker.
export const ShotCard: React.FC<{
  file: string;
  trimBefore: number;
  anchor: { x: number; y: number };
  durationInFrames: number;
}> = ({ file, trimBefore, anchor, durationInFrames }) => {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: FPS, config: { damping: 15, mass: 0.7, stiffness: 130 } });
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <DimmedSpeaker trimBefore={trimBefore} anchor={anchor} durationInFrames={durationInFrames} />
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 285,
          width: 840,
          height: 1180,
          borderRadius: 30,
          overflow: "hidden",
          boxShadow: cardShadow,
          opacity: enter,
          transform: `scale(${(0.93 + 0.07 * enter).toFixed(3)})`,
        }}
      >
        <Img
          src={staticFile(file)}
          style={{
            width: "100%",
            transform: `scale(${(1.12 + 0.1 * p).toFixed(3)}) translateY(${(-40 * p).toFixed(1)}px)`,
            transformOrigin: "50% 30%",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// A real screen recording in a floating card over the dimmed speaker.
export const ScreenRecCard: React.FC<{
  file: string;
  trimBefore: number;
  anchor: { x: number; y: number };
  durationInFrames: number;
  rate?: number;
}> = ({ file, trimBefore, anchor, durationInFrames, rate }) => {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: FPS, config: { damping: 15, mass: 0.7, stiffness: 130 } });
  return (
    <AbsoluteFill>
      <DimmedSpeaker trimBefore={trimBefore} anchor={anchor} durationInFrames={durationInFrames} rate={rate} />
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 300,
          width: 780,
          height: 1200,
          borderRadius: 34,
          overflow: "hidden",
          boxShadow: cardShadow,
          opacity: enter,
          transform: `scale(${(0.93 + 0.07 * enter).toFixed(3)})`,
        }}
      >
        <OffthreadVideo
          src={staticFile(file)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Real license examples for the licenses beat: CC BY-NC (research-only side)
// and Apache-2.0 (commercial side), popping on their spoken words as tossed
// cards in the bottom half of the frame.
export const LicenseShots: React.FC<{
  popA: number;
  popB: number;
  popC: number;
}> = ({ popA, popB, popC }) => {
  const frame = useCurrentFrame();
  const mk = (at: number) =>
    spring({ frame: frame - at, fps: FPS, config: { damping: 14, mass: 0.7, stiffness: 140 } });
  const sA = mk(popA);
  const sB = mk(popB);
  const sC = mk(popC);
  const card = (
    s: number,
    x: number,
    y: number,
    rot: number,
    file: string,
    show: boolean,
    inset = false,
    posY = "0%"
  ) => (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 440,
        height: 470,
        borderRadius: 22,
        overflow: "hidden",
        background: "#FFFFFF",
        boxShadow: cardShadow,
        opacity: show ? s : 0,
        transform: `rotate(${rot}deg) scale(${(0.9 + 0.1 * s).toFixed(3)}) translateY(${(24 * (1 - s)).toFixed(1)}px)`,
      }}
    >
      <Img
        src={staticFile(file)}
        style={{
          width: inset ? "108%" : "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `50% ${posY}`,
          marginLeft: inset ? "4%" : 0,
        }}
      />
    </div>
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {card(sA, 55, 1140, -2, "broll/shot_ccbync.png", frame >= popA, false, "14%")}
      {card(sB, 585, 1140, 2, "broll/shot_apache.png", frame >= popB, true)}
      {card(sC, 305, 1255, -1.5, "broll/shot_mit.png", frame >= popC, true)}
    </AbsoluteFill>
  );
};
