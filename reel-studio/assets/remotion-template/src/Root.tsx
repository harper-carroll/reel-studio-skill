import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { WIDTH, HEIGHT, FPS } from "./shots";
import captions from "./captions.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={captions.durationInFrames}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
