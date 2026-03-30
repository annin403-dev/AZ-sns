import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { fontFamily } from './fonts';

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1Spring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.6 },
    from: 0,
    to: 1,
    delay: 0,
  });

  const line2Spring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.6 },
    from: 0,
    to: 1,
    delay: 12,
  });

  const bgOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(160deg, #FFD6EC 0%, #F8C8E8 30%, #E8C8F0 60%, #D4C8F8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        opacity: bgOpacity,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景デコレーション */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 80,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          right: 60,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'rgba(212,200,248,0.4)',
          filter: 'blur(80px)',
        }}
      />

      {/* メインテキスト */}
      <div
        style={{
          textAlign: 'center',
          padding: '0 60px',
          transform: `scale(${line1Spring})`,
        }}
      >
        <p
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 80,
            color: '#8B4A7E',
            margin: 0,
            lineHeight: 1.4,
            textShadow: '0 2px 12px rgba(139,74,126,0.2)',
          }}
        >
          🌸 マルシェ出店します 🌸
        </p>
      </div>

      <div style={{ height: 40 }} />

      {/* サブテキスト */}
      <div
        style={{
          textAlign: 'center',
          padding: '32px 60px',
          background: 'rgba(255,255,255,0.6)',
          borderRadius: 40,
          backdropFilter: 'blur(12px)',
          transform: `scale(${line2Spring})`,
          boxShadow: '0 8px 32px rgba(139,74,126,0.15)',
        }}
      >
        <p
          style={{
            fontFamily,
            fontWeight: 700,
            fontSize: 64,
            color: '#6B3A8E',
            margin: 0,
          }}
        >
          詳細はプロフへ
        </p>
        <p
          style={{
            fontFamily,
            fontWeight: 400,
            fontSize: 44,
            color: '#9B6AAE',
            margin: '12px 0 0',
          }}
        >
          ↓ follow & check ↓
        </p>
      </div>
    </div>
  );
};
