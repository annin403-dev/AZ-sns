import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: {
      damping: 6,
      stiffness: 200,
      mass: 0.8,
    },
    from: 0,
    to: 1,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        <p
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: "#FFFFFF",
            margin: 0,
            lineHeight: 1.3,
            textShadow: "0 0 30px rgba(255,255,255,0.3)",
          }}
        >
          このコたち、
        </p>
        <p
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: "#FFB7C5",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          全員手作り🧸
        </p>
      </div>
    </AbsoluteFill>
  );
};
