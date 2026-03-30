import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { fontFamily } from './fonts';

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: {
      damping: 8,
      stiffness: 200,
      mass: 0.5,
    },
    from: 0,
    to: 1,
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: 'center',
          padding: '0 60px',
        }}
      >
        <p
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 88,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.3,
            textShadow: '0 4px 24px rgba(255,182,193,0.6)',
          }}
        >
          このコたち、
        </p>
        <p
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 88,
            color: '#FFB6D9',
            margin: 0,
            lineHeight: 1.3,
            textShadow: '0 4px 24px rgba(255,182,193,0.8)',
          }}
        >
          全員手作り🧸
        </p>
      </div>
    </div>
  );
};
