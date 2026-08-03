import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  getInputProps,
  interpolate,
  staticFile,
} from "remotion";
import type { LockupVariant } from "./titles";
import {
  EDL,
  SEG_START_F,
  segDurF,
  relF,
  ANCHOR,
  FPS,
  TITLE_PANEL_H,
  Seg,
} from "./layout";
import { SpeakerView } from "./SpeakerView";
import { BrollView, ShotCard, ScreenRecCard, LicenseShots } from "./broll";
import { GRAPHICS } from "./graphics2";
import {
  TitleLockup,
  SpectrumGraphic,
  EndTitle,
  LicensesCard,
  NameTag,
} from "./titles";
import { CaptionsCream } from "./CaptionsCream";
import { SoftGrain } from "./SoftGrain";
import { loadTitleFont } from "./titleFont";

// Per-framing crop + Ken Burns settings. Tight framings fill the frame with the
// speakers; *_title framings stay looser so titles/tags own the wall above heads
// (two_title is static so the tag arrow stays locked to the primary speaker's head).
const FRAMING: Record<
  string,
  { anchor: { x: number; y: number }; z0: number; z1: number }
> = {
  two_title: { anchor: ANCHOR.twoTitle, z0: 1.3, z1: 1.3 },
  two: { anchor: ANCHOR.two, z0: 1.62, z1: 1.66 },
  primary_title: { anchor: ANCHOR.primaryTitle, z0: 1.7, z1: 1.78 },
  primary: { anchor: ANCHOR.primary, z0: 2.05, z1: 2.12 },
  guest_title: { anchor: ANCHOR.guestTitle, z0: 1.95, z1: 1.98 },
  guest: { anchor: ANCHOR.guest, z0: 2.0, z1: 2.08 },
  guest2: { anchor: ANCHOR.guest2, z0: 2.55, z1: 2.62 },
};

// Flat wall-matched blue over the ceiling/lamp band (spec: static blue that
// matches the rest of the background). Sits under scrims/cards, over footage.
const CeilingCover: React.FC<{ h: number; fade?: number }> = ({ h, fade = 80 }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: 1080,
      height: h + fade,
      background: `linear-gradient(180deg, #a0b4c3 0%, #a0b4c3 ${((h / (h + fade)) * 100).toFixed(1)}%, rgba(160,180,195,0) 100%)`,
      pointerEvents: "none",
    }}
  />
);

const SegmentView: React.FC<{ seg: Seg; i: number }> = ({ seg, i }) => {
  const durF = segDurF(i);
  const trimBefore = Math.round(seg.in * FPS);
  const rate = seg.rate ?? 1;
  const cardAnchorFor =
    seg.speaker === "primary" ? ANCHOR.primaryCard : ANCHOR.guestCard;
  // continuity across micro-splices: same graphic/title continues without
  // re-animating in, and only the last piece animates out
  const prev = i > 0 ? EDL[i - 1] : undefined;
  const next = i + 1 < EDL.length ? EDL[i + 1] : undefined;
  const graphicEntered = !!prev && !!seg.graphic && prev.graphic === seg.graphic;
  const titleEntered = !!prev && !!seg.title && prev.title === seg.title;
  const titleExits = !(next && seg.title && next.title === seg.title);

  // J-cut: the PREVIOUS graphic card stays up (camera resting, marks ticked)
  // while the footage underneath runs LIVE into this segment's line.
  if (seg.framing === "hold_graphic" && prev?.graphic) {
    const G = GRAPHICS[prev.graphic];
    const z = seg.speaker === "primary" ? 1.76 : 1.74;
    return (
      <AbsoluteFill>
        <SpeakerView
          trimBefore={trimBefore}
          anchor={cardAnchorFor}
          z0={z}
          z1={z + 0.02}
          durationInFrames={durF}
          rate={rate}
        />
        <CeilingCover h={110} />
        {G ? <G segIndex={i} entered /> : null}
      </AbsoluteFill>
    );
  }

  // The split open: cream title panel on top, tight STATIC two-shot pane below
  // (static so the tag arrow stays locked to the primary speaker's head).
  if (seg.framing === "title_split") {
    return (
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: TITLE_PANEL_H,
            left: 0,
            width: 1080,
            height: 1920 - TITLE_PANEL_H,
            overflow: "hidden",
          }}
        >
          <SpeakerView
            trimBefore={trimBefore}
            anchor={ANCHOR.twoPane}
            z0={1.5}
            z1={1.5}
            durationInFrames={durF}
            viewW={1080}
            viewH={1920 - TITLE_PANEL_H}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1080,
            height: TITLE_PANEL_H,
            background:
              "linear-gradient(160deg, #F6F0E5 0%, #F1EADC 55%, #EBE2D0 100%)",
            boxShadow: "0 10px 40px rgba(35,24,12,0.3)",
          }}
        >
          <TitleLockup
            durationInFrames={durF}
            variant={(getInputProps() as { titleVariant?: LockupVariant }).titleVariant}
            entered={titleEntered}
          />
          <NameTag
            lines={["Speaker Name", "Role", "Affiliation"]} // replace with the speaker's tag
            x={300}
            y={750}
            width={340}
            align="right"
            arrow={{
              x1: 655,
              y1: 808,
              x2: 940,
              y2: 1048,
              bend: 0,
              cp: { x: 1015, y: 845 },
            }}
            enterF={titleEntered ? -100 : Math.round(0.35 * 30)}
            exitF={durF + 30}
            color="ink"
          />
        </div>
      </AbsoluteFill>
    );
  }

  if (seg.framing === "broll" && seg.file) {
    return <BrollView file={seg.file} trim={seg.trim} durationInFrames={durF} />;
  }

  if (seg.framing === "shot" && seg.file) {
    return (
      <ShotCard
        file={seg.file}
        trimBefore={trimBefore}
        anchor={cardAnchorFor}
        durationInFrames={durF}
      />
    );
  }

  if (seg.framing === "screenrec" && seg.file) {
    return (
      <ScreenRecCard
        file={seg.file}
        trimBefore={trimBefore}
        anchor={cardAnchorFor}
        durationInFrames={durF}
        rate={rate}
      />
    );
  }

  if (seg.framing === "split") {
    // Graphic beats: the speaker stays full-frame (face visible below) and the
    // graphic floats over the footage as a rounded card — the reference
    // episode's screen-recording-card treatment.
    const G = GRAPHICS[seg.graphic ?? ""];
    const z = seg.speaker === "primary" ? 1.76 : 1.74;
    return (
      <AbsoluteFill>
        <SpeakerView
          trimBefore={trimBefore}
          anchor={cardAnchorFor}
          z0={z}
          z1={z + 0.05}
          durationInFrames={durF}
          rate={rate}
        />
        <CeilingCover h={110} />
        {G ? <G segIndex={i} entered={graphicEntered} /> : null}
      </AbsoluteFill>
    );
  }

  const f = FRAMING[seg.framing];
  // a small zoom step across a same-framing take splice reads as a deliberate
  // punch instead of a jump cut (seg 2 continues seg 1's framing)
  const zBoost = seg.id === 2 ? 0.08 : 0;
  return (
    <AbsoluteFill>
      <SpeakerView
        trimBefore={trimBefore}
        anchor={f.anchor}
        z0={f.z0 + zBoost}
        z1={f.z1 + zBoost}
        durationInFrames={durF}
        rate={rate}
      />
      {seg.title === "lockup" ? (
        <>
          <CeilingCover h={290} fade={90} />
          <TitleLockup
            durationInFrames={durF}
            variant={(getInputProps() as { titleVariant?: LockupVariant }).titleVariant}
            entered={titleEntered}
          />
          <NameTag
            lines={["Speaker Name", "Role", "Affiliation"]} // replace with the speaker's tag
            x={620}
            y={790}
            width={340}
            align="right"
            arrow={{ x1: 872, y1: 952, x2: 850, y2: 1000, bend: -12 }}
            enterF={titleEntered ? -100 : Math.round(1.3 * 30)}
            exitF={durF + 30}
            color="cream"
          />
          <NameTag
            lines={["Guest Name", "Role", "Affiliation"]} // replace with the guest's tag
            x={120}
            y={790}
            width={340}
            align="left"
            arrow={{ x1: 238, y1: 952, x2: 252, y2: 1140, bend: 14 }}
            enterF={titleEntered ? -100 : Math.round(1.55 * 30)}
            exitF={durF + 30}
            color="cream"
          />
        </>
      ) : null}
      {seg.title === "spectrum" ? (
        <SpectrumGraphic durationInFrames={durF} />
      ) : null}
      {seg.title === "ep3" ? <EndTitle durationInFrames={durF} /> : null}
      {seg.title === "licenses" ? (
        <>
          <LicensesCard durationInFrames={durF} entered={titleEntered} exits={titleExits} />
          <LicenseShots popA={relF(i, 123.0)} popB={relF(i, 124.74)} popC={relF(i, 126.62)} />
          <NameTag
            lines={["Guest Name", "Role", "Affiliation"]} // replace with the guest's tag
            x={610}
            y={295}
            width={340}
            align="right"
            arrow={{ x1: 790, y1: 478, x2: 720, y2: 512, bend: -16 }}
            enterF={titleEntered ? -100 : Math.round(0.5 * 30)}
            exitF={titleExits ? durF - 14 : durF + 60}
            color="cream"
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export const PodcastReel: React.FC = () => {
  loadTitleFont();
  return (
    <AbsoluteFill style={{
      backgroundColor: "#101010"
    }}>
      {EDL.map((seg, i) => {
        const durF = segDurF(i);
        const audioStart = Math.round(seg.in * FPS);
        // Fade audio ONLY at real source cuts — a fade at a visual-only
        // boundary inside a continuous take dips mid-word.
        const contPrev = i > 0 && Math.abs(EDL[i - 1].out - seg.in) < 0.001;
        const contNext =
          i + 1 < EDL.length && Math.abs(EDL[i + 1].in - seg.out) < 0.001;
        return (
          <Sequence key={seg.id} from={SEG_START_F[i]} durationInFrames={durF}>
            <SegmentView seg={seg} i={i} />
            <Audio
              src={staticFile("audio.m4a")}
              playbackRate={seg.rate ?? 1}
              trimBefore={audioStart}
              trimAfter={audioStart + Math.round(durF * (seg.rate ?? 1))}
              volume={(f) => {
                if (contPrev && contNext) return 1;
                const range = contPrev
                  ? [0, durF - 2, durF]
                  : contNext
                    ? [0, 2, durF]
                    : [0, 2, durF - 2, durF];
                const vals = contPrev
                  ? [1, 1, 0]
                  : contNext
                    ? [0, 1, 1]
                    : [0, 1, 1, 0];
                return interpolate(f, range, vals, {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
              }}
            />
          </Sequence>
        );
      })}
      <SoftGrain />
      <CaptionsCream />
    </AbsoluteFill>
  );
};
