/**
 * TypePixelArt
 *
 * タイプ別ピクセルキャラクター（結果画面用）。
 * 8タイプ × ポーズ設計。
 *
 * 各タイプのキャラクターイメージ:
 *   Pioneer    挑戦者  一歩踏み出すポーズ・旗持ち
 *   Architect  構築者  設計図を広げるポーズ
 *   Creator    創造者  両手から光が出るポーズ
 *   Strategist 設計者  駒を持ってじっと考えるポーズ
 *   Healer     奉仕者  両手を差し出すポーズ
 *   Connector  つなぐ人 両手を広げてつなぐポーズ
 *   Scholar    探究者  本・虫眼鏡を持つポーズ
 *   Storyteller 語り部  口を開けて語るポーズ
 *
 * 現フェーズでは色・シルエットで差別化。
 * 詳細なポーズは順次更新予定。
 */

import type { JobType } from "@/lib/diagnosis/questions";

// タイプ別カラー設定（髪・服のアクセント）
const TYPE_COLORS: Record<JobType, { hair: string; accent: string; glow: string }> = {
  Pioneer:     { hair: "#F05252", accent: "#DC2626", glow: "rgba(240,82,82,0.2)" },
  Architect:   { hair: "#38B2AC", accent: "#2C7A7B", glow: "rgba(56,178,172,0.2)" },
  Creator:     { hair: "#9060E0", accent: "#6D28D9", glow: "rgba(144,96,224,0.2)" },
  Strategist:  { hair: "#E05050", accent: "#9B1C1C", glow: "rgba(220,80,80,0.2)" },
  Healer:      { hair: "#38C074", accent: "#276749", glow: "rgba(56,192,116,0.2)" },
  Connector:   { hair: "#F0A040", accent: "#C05000", glow: "rgba(240,160,64,0.2)" },
  Scholar:     { hair: "#4090E0", accent: "#1D4ED8", glow: "rgba(64,144,224,0.2)" },
  Storyteller: { hair: "#E0A030", accent: "#B45309", glow: "rgba(224,160,48,0.2)" },
};

// 共通の顔・体ピクセルマップ（タイプ別に色を変える）
// 0=透明, 1=髪, 2=肌, 3=服（薄）, 4=服（濃・目）, 5=アクセント
const BASE_PIXELS = [
  [0, 0, 1, 1, 1, 1, 0, 0], // 髪
  [0, 1, 1, 1, 1, 1, 1, 0], // 髪
  [0, 2, 2, 2, 2, 2, 2, 0], // 顔
  [0, 2, 4, 2, 2, 4, 2, 0], // 目（二つ）
  [0, 2, 2, 2, 2, 2, 2, 0], // 顔
  [0, 0, 2, 2, 2, 2, 0, 0], // あご
  [0, 3, 3, 4, 4, 3, 3, 0], // 体
  [3, 3, 3, 4, 4, 3, 3, 3], // 体
  [3, 3, 0, 3, 3, 0, 3, 3], // 足
  [0, 3, 0, 0, 0, 0, 3, 0], // 足
] as const;

const PIXEL_SIZE = 8;

interface TypePixelArtProps {
  jobType: JobType;
  scale?: number;
}

export function TypePixelArt({ jobType, scale = 1 }: TypePixelArtProps) {
  const colors = TYPE_COLORS[jobType];
  const px = PIXEL_SIZE * scale;
  const cols = BASE_PIXELS[0].length;
  const rows = BASE_PIXELS.length;

  const colorMap: Record<number, string> = {
    1: colors.hair,
    2: "#FDDBB0",
    3: colors.hair + "80", // 服（薄）= 髪色の透明版
    4: colors.accent,
  };

  return (
    <div
      style={{
        display: "inline-block",
        imageRendering: "pixelated",
        filter: `drop-shadow(0 4px 16px ${colors.glow})`,
      }}
    >
      <svg
        width={px * cols}
        height={px * rows}
        viewBox={`0 0 ${px * cols} ${px * rows}`}
        style={{ imageRendering: "pixelated" }}
        aria-hidden="true"
      >
        {BASE_PIXELS.map((row, y) =>
          row.map((cell, x) => {
            if (cell === 0) return null;
            return (
              <rect
                key={`${x}-${y}`}
                x={x * px}
                y={y * px}
                width={px}
                height={px}
                fill={colorMap[cell]}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
