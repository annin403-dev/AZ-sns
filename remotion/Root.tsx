import React from 'react';
import { Composition } from 'remotion';
import { MoleDollVideo } from './MoleDollVideo';

export const Root: React.FC = () => {
  return (
    <Composition
      id="MoleDollMarket"
      component={MoleDollVideo}
      durationInFrames={450} // 15秒 × 30fps
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
