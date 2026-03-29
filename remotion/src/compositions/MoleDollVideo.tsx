import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
} from "remotion";

const FPS = 30;

// ===== シーン定義 (フレーム数) =====
const SCENE1_START = 0;            // オープニング        0〜4秒
const SCENE2_START = FPS * 5;     // ドール紹介1          5〜11秒
const SCENE3_START = FPS * 12;    // リースアレンジ       12〜19秒
const SCENE4_START = FPS * 20;    // マルシェ情報         20〜25秒
const TOTAL = FPS * 25;

// ===== 字幕スクリプト =====
// [開始フレーム, 終了フレーム, テキスト]
const SUBTITLES: [number, number, string][] = [
  [FPS * 0.5, FPS * 4,   "こんにちは！私が作ったモールドールを紹介します🐻"],
  [FPS * 5,   FPS * 8,   "ピカチュウ・キティちゃん・BT21…"],
  [FPS * 8,   FPS * 11.5, "全部、私が手で作りました！"],
  [FPS * 12,  FPS * 15,  "フラワーリースと合わせても可愛いでしょ？🌸"],
  [FPS * 15,  FPS * 19,  "ひとつひとつ、丁寧に作っています💕"],
  [FPS * 20,  FPS * 23,  "マルシェに出店するので、ぜひ来てね！"],
  [FPS * 23,  FPS * 25,  "待ってるよ〜！🎪"],
];

// ===== 汎用アニメーションヘルパー =====
function useFadeIn(startFrame: number, durationFrames = 20) {
  const frame = useCurrentFrame();
  return interpolate(frame - startFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function useSpring(startFrame: number, frame: number, fps: number) {
  return spring({
    fps,
    frame: frame - startFrame,
    config: { damping: 14, stiffness: 80 },
    durationInFrames: 40,
  });
}

// ===== 字幕コンポーネント =====
const Subtitle: React.FC = () => {
  const frame = useCurrentFrame();
  const activeSubtitle = SUBTITLES.find(
    ([start, end]) => frame >= start && frame <= end
  );

  if (!activeSubtitle) return null;

  const [start, end, text] = activeSubtitle;
  const fadeIn = interpolate(frame - start, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [end - 8, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = fadeIn * fadeOut;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 120,
        left: 40,
        right: 40,
        opacity,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.72)",
          borderRadius: 24,
          padding: "20px 36px",
          backdropFilter: "blur(8px)",
          border: "1.5px solid rgba(255,255,255,0.15)",
          maxWidth: 900,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily:
              "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
            textAlign: "center",
            lineHeight: 1.4,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            letterSpacing: "0.05em",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

// ===== 花びらパーティクル =====
const PETALS = [
  { x: 5,  delay: 0,  size: 18, color: "#ffb7c5", speed: 1.2 },
  { x: 20, delay: 8,  size: 14, color: "#f9d0e8", speed: 0.9 },
  { x: 40, delay: 3,  size: 22, color: "#ffc0cb", speed: 1.0 },
  { x: 60, delay: 12, size: 16, color: "#e8a0bf", speed: 1.3 },
  { x: 75, delay: 5,  size: 20, color: "#ffb7c5", speed: 0.8 },
  { x: 90, delay: 1,  size: 12, color: "#ffd6e7", speed: 1.1 },
  { x: 15, delay: 18, size: 15, color: "#f9d0e8", speed: 1.0 },
  { x: 55, delay: 22, size: 19, color: "#ffc0cb", speed: 1.2 },
  { x: 85, delay: 10, size: 13, color: "#e8a0bf", speed: 0.95 },
  { x: 30, delay: 28, size: 17, color: "#ffb7c5", speed: 1.05 },
];

const Petal: React.FC<{
  x: number; delay: number; size: number; color: string; speed: number;
}> = ({ x, delay, size, color, speed }) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - delay);
  const cycle = 1920 / (speed * 1.5);
  const progress = (elapsed % cycle) / cycle;
  const y = progress * 2100 - 100;
  const rotate = elapsed * 3;
  const wobble = Math.sin(elapsed * 0.05) * 15;
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: y,
        transform: `rotate(${rotate}deg) translateX(${wobble}px)`,
        width: size,
        height: size,
        borderRadius: "50% 0 50% 0",
        background: color,
        opacity: 0.7,
      }}
    />
  );
};

const FloatingPetals: React.FC = () => (
  <>
    {PETALS.map((p, i) => (
      <Petal key={i} {...p} />
    ))}
  </>
);

// ===== キラキラ星 =====
const STARS = [
  { x: 10, y: 15, delay: 0 },
  { x: 88, y: 22, delay: 5 },
  { x: 50, y: 8,  delay: 10 },
  { x: 25, y: 40, delay: 3 },
  { x: 75, y: 55, delay: 7 },
  { x: 90, y: 70, delay: 12 },
  { x: 5,  y: 80, delay: 2 },
  { x: 60, y: 88, delay: 9 },
];

const Sparkle: React.FC<{ x: number; y: number; delay: number }> = ({
  x, y, delay,
}) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - delay);
  const opacity = 0.5 + 0.5 * Math.sin(t * 0.2);
  const scale = 0.8 + 0.4 * Math.sin(t * 0.15);
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `scale(${scale})`,
        opacity,
        fontSize: 28,
        color: "#fff",
        textShadow: "0 0 12px #ffd6e7",
      }}
    >
      ✦
    </div>
  );
};

// ===== 背景 =====
const Background: React.FC<{ scene: number }> = ({ scene }) => {
  const gradients = [
    "linear-gradient(160deg, #ffe0ec 0%, #ffc2d4 40%, #ffaec9 100%)",
    "linear-gradient(160deg, #fff0f5 0%, #ffd6e7 50%, #ffb7d5 100%)",
    "linear-gradient(160deg, #fce4ec 0%, #f8bbd9 50%, #e91e8c22 100%)",
    "linear-gradient(160deg, #fff9fb 0%, #ffd6e7 40%, #ffb7c5 100%)",
  ];
  return (
    <AbsoluteFill
      style={{ background: gradients[Math.min(scene, gradients.length - 1)] }}
    />
  );
};

// ===== シーン1: オープニング =====
const Scene1Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = useSpring(5, frame, fps);
  const titleOpacity = useFadeIn(5, 20);
  const subOpacity = useFadeIn(28, 20);
  const tagOpacity = useFadeIn(50, 20);
  const emojiOpacity = useFadeIn(10, 25);

  return (
    <AbsoluteFill>
      <Background scene={0} />
      <FloatingPetals />
      {STARS.map((s, i) => <Sparkle key={i} {...s} />)}

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          padding: "0 60px",
        }}
      >
        <div
          style={{
            fontSize: 140,
            opacity: emojiOpacity,
            transform: `scale(${titleScale})`,
            filter: "drop-shadow(0 8px 24px rgba(255,100,150,0.4))",
          }}
        >
          🐻
        </div>

        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "#d4337a",
              fontFamily:
                "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
              letterSpacing: "0.08em",
              lineHeight: 1.2,
              textShadow: "0 4px 20px rgba(212,51,122,0.25)",
            }}
          >
            モールドール
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#e8659a",
              fontFamily:
                "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
              marginTop: 12,
              letterSpacing: "0.12em",
            }}
          >
            Mole Doll ✨
          </div>
        </div>

        <div
          style={{
            opacity: subOpacity,
            background: "rgba(255,255,255,0.85)",
            borderRadius: 60,
            padding: "28px 60px",
            backdropFilter: "blur(12px)",
            border: "2px solid rgba(212,51,122,0.2)",
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#c4306e",
              fontFamily:
                "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
              textAlign: "center",
              letterSpacing: "0.1em",
            }}
          >
            子どもの手作り作品🎀
          </div>
        </div>

        <div
          style={{
            opacity: tagOpacity,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["🌸 ハンドメイド", "💕 一点もの", "✨ マルシェ出品"].map(
            (tag, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(212,51,122,0.12)",
                  border: "1.5px solid rgba(212,51,122,0.3)",
                  borderRadius: 40,
                  padding: "14px 30px",
                  fontSize: 34,
                  color: "#b02d68",
                  fontFamily:
                    "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ===== 画像フレーム =====
const ImageFrame: React.FC<{
  src: string;
  caption: string;
  captionSub?: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ src, caption, captionSub, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = useSpring(delay, frame, fps);
  const opacity = useFadeIn(delay, 18);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        borderRadius: 32,
        overflow: "hidden",
        boxShadow:
          "0 20px 60px rgba(212,51,122,0.25), 0 4px 16px rgba(0,0,0,0.1)",
        border: "3px solid rgba(255,255,255,0.9)",
        position: "relative",
        ...style,
      }}
    >
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(transparent, rgba(180,40,100,0.85))",
          padding: "40px 24px 24px",
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 800,
            color: "#fff",
            fontFamily:
              "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}
        >
          {caption}
        </div>
        {captionSub && (
          <div
            style={{
              fontSize: 26,
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              fontFamily:
                "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
              textAlign: "center",
              marginTop: 4,
            }}
          >
            {captionSub}
          </div>
        )}
      </div>
    </div>
  );
};

// ===== シーン2: ドール棚 =====
const Scene2DollShelf: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOpacity = useFadeIn(0, 20);
  const titleScale = useSpring(0, frame, fps);
  const badgeOpacity = useFadeIn(25, 20);

  return (
    <AbsoluteFill>
      <Background scene={1} />
      <FloatingPetals />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "80px 48px 180px",
          gap: 36,
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 900,
              color: "#d4337a",
              fontFamily:
                "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
              letterSpacing: "0.1em",
              textShadow: "0 3px 12px rgba(212,51,122,0.2)",
            }}
          >
            🧸 かわいいドールたち
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#e8659a",
              fontFamily:
                "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
              marginTop: 10,
              fontWeight: 600,
            }}
          >
            全て手作り・一点もの
          </div>
        </div>

        <ImageFrame
          src={staticFile("images/dolls-shelf.jpg")}
          caption="バラエティ豊かなモールドール"
          captionSub="ピカチュウ・ハローキティ・BT21など"
          delay={5}
          style={{ width: "100%", height: 700 }}
        />

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center",
            opacity: badgeOpacity,
          }}
        >
          {[
            { emoji: "🎨", text: "キャラ豊富" },
            { emoji: "💝", text: "プレゼントに" },
            { emoji: "✂️", text: "全て手縫い" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.9)",
                borderRadius: 50,
                padding: "20px 36px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 4px 16px rgba(212,51,122,0.15)",
                border: "2px solid rgba(212,51,122,0.15)",
              }}
            >
              <span style={{ fontSize: 36 }}>{item.emoji}</span>
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  color: "#c4306e",
                  fontFamily:
                    "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
                }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ===== シーン3: リースアレンジ =====
const Scene3WreathDolls: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOpacity = useFadeIn(0, 20);
  const titleScale = useSpring(0, frame, fps);
  const img2Scale = useSpring(15, frame, fps);
  const img2Opacity = useFadeIn(15, 20);

  return (
    <AbsoluteFill>
      <Background scene={2} />
      <FloatingPetals />
      {STARS.map((s, i) => (
        <Sparkle key={i} x={s.x} y={s.y} delay={s.delay + 5} />
      ))}

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "70px 48px 180px",
          gap: 28,
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: "#c4306e",
              fontFamily:
                "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
              letterSpacing: "0.08em",
              textShadow: "0 3px 12px rgba(196,48,110,0.2)",
            }}
          >
            🌺 フラワーリースと一緒に
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#e8659a",
              fontFamily:
                "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
              marginTop: 8,
              fontWeight: 600,
            }}
          >
            お花と組み合わせても素敵！
          </div>
        </div>

        {/* 2枚横並び */}
        <div style={{ display: "flex", gap: 24, width: "100%" }}>
          <ImageFrame
            src={staticFile("images/wreath-group.jpg")}
            caption="リース×ドール"
            captionSub="グループショット"
            delay={5}
            style={{ flex: 1, height: 520 }}
          />
          <div
            style={{
              flex: 1,
              height: 520,
              opacity: img2Opacity,
              transform: `scale(${img2Scale})`,
              borderRadius: 32,
              overflow: "hidden",
              boxShadow:
                "0 20px 60px rgba(212,51,122,0.25), 0 4px 16px rgba(0,0,0,0.1)",
              border: "3px solid rgba(255,255,255,0.9)",
              position: "relative",
            }}
          >
            <Img
              src={staticFile("images/wreath-rainbow.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background:
                  "linear-gradient(transparent, rgba(180,40,100,0.85))",
                padding: "40px 16px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily:
                    "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
                  textAlign: "center",
                }}
              >
                🌈 レインボーカラー
              </div>
            </div>
          </div>
        </div>

        <ImageFrame
          src={staticFile("images/wreath-white.jpg")}
          caption="白うさぎドール × お花リース"
          captionSub="インテリアにもぴったり"
          delay={20}
          style={{ width: "100%", height: 460 }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ===== シーン4: マルシェ情報 =====
const Scene4Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = useFadeIn(0, 25);
  const titleScale = useSpring(0, frame, fps);
  const infoOpacity = useFadeIn(20, 20);
  const ctaOpacity = useFadeIn(45, 20);
  const ctaScale = useSpring(45, frame, fps);
  const heartOpacity = useFadeIn(55, 20);
  const pulse = 1 + 0.06 * Math.sin(frame * 0.18);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(145deg, #fff0f5 0%, #ffd6e7 45%, #ffb3cc 100%)",
        }}
      />
      <FloatingPetals />
      {STARS.map((s, i) => <Sparkle key={i} {...s} />)}

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 56px 200px",
          gap: 44,
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 110 }}>🎪</div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              color: "#c4306e",
              fontFamily:
                "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
              letterSpacing: "0.1em",
              textShadow: "0 4px 20px rgba(196,48,110,0.25)",
              lineHeight: 1.2,
              marginTop: 16,
            }}
          >
            マルシェに
            <br />
            出店します！
          </div>
        </div>

        {/* イベント情報カード */}
        <div
          style={{
            opacity: infoOpacity,
            background: "rgba(255,255,255,0.92)",
            borderRadius: 40,
            padding: "44px 56px",
            width: "100%",
            boxShadow:
              "0 20px 60px rgba(212,51,122,0.2), 0 4px 16px rgba(0,0,0,0.08)",
            border: "2px solid rgba(212,51,122,0.2)",
            backdropFilter: "blur(12px)",
          }}
        >
          {[
            { icon: "📅", label: "日時", value: "2024年○月○日（○）" },
            { icon: "📍", label: "場所", value: "○○マルシェ会場" },
            { icon: "🕐", label: "時間", value: "10:00〜16:00" },
            { icon: "💰", label: "価格", value: "¥500〜" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: i < 3 ? 28 : 0,
                paddingBottom: i < 3 ? 28 : 0,
                borderBottom:
                  i < 3 ? "1.5px solid rgba(212,51,122,0.12)" : "none",
              }}
            >
              <span style={{ fontSize: 44 }}>{item.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: 26,
                    color: "#e8659a",
                    fontFamily:
                      "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 38,
                    fontWeight: 800,
                    color: "#c4306e",
                    fontFamily:
                      "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTAボタン */}
        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${ctaScale * pulse})`,
            background: "linear-gradient(135deg, #e8659a, #c4306e)",
            borderRadius: 60,
            padding: "32px 72px",
            boxShadow:
              "0 12px 40px rgba(196,48,110,0.4), 0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: "#fff",
              fontFamily:
                "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
              letterSpacing: "0.1em",
              textAlign: "center",
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            🛍️ 会いに来てね！
          </div>
        </div>

        {/* ハッシュタグ */}
        <div style={{ opacity: heartOpacity, textAlign: "center" }}>
          <div
            style={{
              fontSize: 34,
              color: "#d4639a",
              fontFamily:
                "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
          >
            💕 ひとつひとつ心を込めて作りました
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#e8659a",
              fontFamily:
                "'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif",
              marginTop: 12,
              fontWeight: 500,
            }}
          >
            #モールドール #ハンドメイド #マルシェ
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ===== メインコンポジション =====
export const MoleDollVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: "sans-serif" }}>
      {/*
        BGM音楽ファイル
        → public/images/bgm.mp3 に配置してください
        推奨: ポップでかわいいロイヤリティフリー音楽
        例: https://www.bensound.com/royalty-free-music (Ukulele, Happy, Sunny)
            https://pixabay.com/music/ (検索: cute pop, kawaii, happy)
      */}
      <Audio
        src={staticFile("images/bgm.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 15, TOTAL - 30, TOTAL],
            [0, 0.7, 0.7, 0],       // フェードイン・フェードアウト
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
        loop
      />

      {/* シーン1: オープニング */}
      <Sequence
        from={SCENE1_START}
        durationInFrames={SCENE2_START - SCENE1_START + 10}
      >
        <Scene1Opening />
      </Sequence>

      {/* シーン2: 棚ドール */}
      <Sequence
        from={SCENE2_START}
        durationInFrames={SCENE3_START - SCENE2_START + 10}
      >
        <Scene2DollShelf />
      </Sequence>

      {/* シーン3: リース */}
      <Sequence
        from={SCENE3_START}
        durationInFrames={SCENE4_START - SCENE3_START + 10}
      >
        <Scene3WreathDolls />
      </Sequence>

      {/* シーン4: クロージング */}
      <Sequence from={SCENE4_START} durationInFrames={TOTAL - SCENE4_START}>
        <Scene4Closing />
      </Sequence>

      {/* 字幕 (全シーン共通でオーバーレイ) */}
      <Subtitle />
    </AbsoluteFill>
  );
};
