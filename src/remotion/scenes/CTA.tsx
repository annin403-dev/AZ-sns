import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const springConfig = {
    damping: 12,
    stiffness: 150,
    mass: 0.9,
  };

  // Line 1: 🌸 マルシェ出店します 🌸
  const line1Scale = spring({
    frame,
    fps,
    config: springConfig,
    from: 0,
    to: 1,
    delay: 0,
  });

  // Line 2: 詳細はプロフへ
  const line2Scale = spring({
    frame,
    fps,
    config: springConfig,
    from: 0,
    to: 1,
    delay: 8,
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #FFD6E7 0%, #E8D5F5 50%, #D4E8FF 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      {/* Decorative dots */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor:
              i % 3 === 0 ? "#FFB7C5" : i % 3 === 1 ? "#C9A8F5" : "#A8D8F5",
            opacity: 0.5,
            left: `${(i * 97) % 90 + 5}%`,
            top: `${(i * 73 + 10) % 80 + 5}%`,
          }}
        />
      ))}

      <div
        style={{
          transform: `scale(${line1Scale})`,
          textAlign: "center",
          paddingLeft: 40,
          paddingRight: 40,
        }}
      >
        <p
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: 900,
            fontSize: 64,
            color: "#7B4F9E",
            margin: 0,
            lineHeight: 1.3,
            textShadow: "0 2px 8px rgba(123,79,158,0.2)",
          }}
        >
          🌸 マルシェ出店します 🌸
        </p>
      </div>

      <div
        style={{
          transform: `scale(${line2Scale})`,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: 700,
            fontSize: 48,
            color: "#C46FA0",
            margin: 0,
            backgroundColor: "rgba(255,255,255,0.6)",
            paddingLeft: 48,
            paddingRight: 48,
            paddingTop: 16,
            paddingBottom: 16,
            borderRadius: 50,
          }}
        >
          詳細はプロフへ ✨
        </p>
      </div>
    </AbsoluteFill>
  );
};
