import React from "react";
import { Composition } from "remotion";
import { MoleDollVideo, TOTAL_FRAMES, FPS } from "./MoleDollVideo";
import { loadFont } from "@remotion/google-fonts/NotoSansJP";

// Load Noto Sans JP
loadFont();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MoleDollMarche"
        component={MoleDollVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
