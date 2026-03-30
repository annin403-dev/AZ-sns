import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, staticFile } from 'remotion';
import { fontFamily } from './fonts';

const CAPTIONS = ['ふわふわ✨', 'かわいい🌸', 'てづくり💕', 'たいせつなこ🧸'];
const PHOTOS = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg'];

// 各写真の表示時間（フレーム）
const PHOTO_DURATION = 75; // 2.5秒 × 30fps

interface PhotoSlideProps {
  src: string;
  caption: string;
  localFrame: number;
  duration: number;
}

const PhotoSlide: React.FC<PhotoSlideProps> = ({ src, caption, localFrame, duration }) => {
  // Ken Burns: ゆっくりズームイン
  const scale = interpolate(localFrame, [0, duration], [1.0, 1.12], {
    extrapolateRight: 'clamp',
  });

  // フェードイン・アウト
  const opacity = interpolate(
    localFrame,
    [0, 15, duration - 15, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  // キャプションフェードイン
  const captionOpacity = interpolate(localFrame, [20, 40], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const captionTranslateY = interpolate(localFrame, [20, 40], [20, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        overflow: 'hidden',
      }}
    >
      <img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      />
      {/* グラデーションオーバーレイ */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
        }}
      />
      {/* キャプション */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: captionOpacity,
          transform: `translateY(${captionTranslateY}px)`,
        }}
      >
        <span
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 96,
            color: '#ffffff',
            textShadow: '0 2px 16px rgba(0,0,0,0.8), 0 0 32px rgba(255,182,217,0.6)',
            letterSpacing: '0.05em',
          }}
        >
          {caption}
        </span>
      </div>
    </div>
  );
};

export const DollScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#000' }}>
      {PHOTOS.map((photo, i) => {
        const slideLocalFrame = frame - i * PHOTO_DURATION;
        const isVisible = slideLocalFrame >= -15 && slideLocalFrame < PHOTO_DURATION + 15;
        if (!isVisible) return null;
        return (
          <PhotoSlide
            key={photo}
            src={photo}
            caption={CAPTIONS[i]}
            localFrame={slideLocalFrame}
            duration={PHOTO_DURATION}
          />
        );
      })}
    </div>
  );
};
