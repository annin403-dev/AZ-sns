import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { HookScene } from './HookScene';
import { DollScene } from './DollScene';
import { CTAScene } from './CTAScene';

// フレーム定数（30fps）
const HOOK_START = 0;
const HOOK_DURATION = 60;   // 0〜2秒

const DOLL_START = 60;
const DOLL_DURATION = 300;  // 2〜12秒（4枚 × 2.5秒）

const CTA_START = 360;
const CTA_DURATION = 90;    // 12〜15秒

export const MoleDollVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* BGM */}
      <Audio
        src={staticFile('bgm.mp3')}
        volume={0.3}
        startFrom={0}
      />

      {/* シーン1: フック */}
      <Sequence from={HOOK_START} durationInFrames={HOOK_DURATION}>
        <HookScene />
      </Sequence>

      {/* シーン2: ドール紹介 */}
      <Sequence from={DOLL_START} durationInFrames={DOLL_DURATION}>
        <DollScene />
      </Sequence>

      {/* シーン3: CTA */}
      <Sequence from={CTA_START} durationInFrames={CTA_DURATION}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
