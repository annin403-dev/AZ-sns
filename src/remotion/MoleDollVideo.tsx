import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { Hook } from "./scenes/Hook";
import { DollSlide } from "./scenes/DollSlide";
import { CTA } from "./scenes/CTA";

const FPS = 30;

// Scene timing (frames)
const HOOK_START = 0;
const HOOK_DURATION = 2 * FPS; // 0–2s = 60 frames

const DOLLS_START = HOOK_DURATION; // 60
const DOLL_DURATION = Math.round(2.5 * FPS); // 75 frames each

const CTA_START = DOLLS_START + DOLL_DURATION * 4; // 60 + 300 = 360
const CTA_DURATION = 3 * FPS; // 90 frames

const TOTAL_FRAMES = CTA_START + CTA_DURATION; // 450

const dolls = [
  { photo: "photo1.jpg", caption: "ふわふわ✨", color: "#A8D8F5" },
  { photo: "photo2.jpg", caption: "かわいい🍰", color: "#FFB7C5" },
  { photo: "photo3.jpg", caption: "個性派💫", color: "#C9A8F5" },
  { photo: "photo4.jpg", caption: "てづくり愛🎀", color: "#FFD6A5" },
];

export const MoleDollVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* BGM */}
      <Audio
        src={staticFile("bgm.mp3")}
        volume={0.3}
        startFrom={0}
      />

      {/* Hook: 0–2s */}
      <Sequence from={HOOK_START} durationInFrames={HOOK_DURATION}>
        <Hook />
      </Sequence>

      {/* Doll slides: 2–12s */}
      {dolls.map((doll, i) => (
        <Sequence
          key={doll.photo}
          from={DOLLS_START + i * DOLL_DURATION}
          durationInFrames={DOLL_DURATION}
        >
          <DollSlide
            photoSrc={doll.photo}
            caption={doll.caption}
            captionColor={doll.color}
          />
        </Sequence>
      ))}

      {/* CTA: 12–15s */}
      <Sequence from={CTA_START} durationInFrames={CTA_DURATION}>
        <CTA />
      </Sequence>
    </AbsoluteFill>
  );
};

export { TOTAL_FRAMES, FPS };
