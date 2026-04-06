import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface DollSlideProps {
  photoSrc: string;
  caption: string;
  captionColor?: string;
}

export const DollSlide: React.FC<DollSlideProps> = ({
  photoSrc,
  caption,
  captionColor = "#FFB7C5",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Ken Burns: slow zoom in from 1.0 to 1.08
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.08], {
    extrapolateRight: "clamp",
  });

  // Caption fade in after 0.5s
  const captionOpacity = spring({
    frame: frame - Math.round(fps * 0.5),
    fps,
    config: {
      damping: 20,
      stiffness: 80,
    },
    from: 0,
    to: 1,
  });

  const captionTranslateY = interpolate(
    captionOpacity,
    [0, 1],
    [20, 0]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Photo with Ken Burns */}
      <AbsoluteFill>
        <Img
          src={staticFile(photoSrc)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        />
      </AbsoluteFill>

      {/* Dark gradient overlay at bottom */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Caption */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 120,
        }}
      >
        <div
          style={{
            opacity: captionOpacity,
            transform: `translateY(${captionTranslateY}px)`,
            backgroundColor: "rgba(0,0,0,0.45)",
            borderRadius: 40,
            paddingLeft: 48,
            paddingRight: 48,
            paddingTop: 18,
            paddingBottom: 18,
            backdropFilter: "blur(8px)",
            border: `2px solid ${captionColor}`,
          }}
        >
          <p
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 700,
              fontSize: 56,
              color: captionColor,
              margin: 0,
              letterSpacing: "0.05em",
            }}
          >
            {caption}
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
