/**
 * SeekerPixelArt
 *
 * ランディングページ用メインキャラクター。
 * - 上を見上げるポーズ（自己理解・成長のメタファー）
 * - 二つの目がはっきり見えるデザイン（一つ目モチーフを廃止）
 * - 頭上に小さな星（可能性・目標のメタファー）
 * - 16×8px = 1ドット。SVGで描画するため拡大してもシャープ。
 *
 * カラーパレット:
 *   1 = #7C5CDB  髪（AZパープル）
 *   2 = #FDDBB0  肌
 *   3 = #B89EF0  服（薄紫）
 *   4 = #3A3A5C  目・服のアクセント（濃紺）
 *   5 = #F5C842  星（ゴールド）
 */

const PIXEL_SIZE = 8; // 1ドット = 8px

// ピクセルマップ（0=透明）
const PIXELS = [
  // 星（頭上）
  [0, 0, 0, 0, 5, 0, 0, 0],
  [0, 0, 0, 5, 5, 5, 0, 0],
  [0, 0, 0, 0, 5, 0, 0, 0],
  // 髪
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  // 顔（上向き気味）
  [0, 2, 2, 2, 2, 2, 2, 0],
  [0, 2, 4, 2, 2, 4, 2, 0], // 二つの目（4=濃紺の点）
  [0, 2, 2, 2, 2, 2, 2, 0],
  [0, 0, 2, 2, 2, 2, 0, 0], // あご
  // 体
  [0, 3, 3, 4, 4, 3, 3, 0],
  [3, 3, 3, 4, 4, 3, 3, 3],
  // 足
  [3, 3, 0, 3, 3, 0, 3, 3],
  [0, 3, 0, 0, 0, 0, 3, 0],
] as const;

const COLOR_MAP: Record<number, string> = {
  1: "#7C5CDB",
  2: "#FDDBB0",
  3: "#B89EF0",
  4: "#3A3A5C",
  5: "#F5C842",
};

interface SeekerPixelArtProps {
  scale?: number; // ドットサイズの倍率（デフォルト1 = 8px/ドット）
}

export function SeekerPixelArt({ scale = 1 }: SeekerPixelArtProps) {
  const px = PIXEL_SIZE * scale;
  const cols = PIXELS[0].length;
  const rows = PIXELS.length;

  return (
    <div
      style={{
        display: "inline-block",
        imageRendering: "pixelated",
        filter: "drop-shadow(0 4px 16px rgba(124, 92, 219, 0.22))",
      }}
    >
      <svg
        width={px * cols}
        height={px * rows}
        viewBox={`0 0 ${px * cols} ${px * rows}`}
        style={{ imageRendering: "pixelated" }}
        aria-hidden="true"
      >
        {PIXELS.map((row, y) =>
          row.map((cell, x) => {
            if (cell === 0) return null;
            return (
              <rect
                key={`${x}-${y}`}
                x={x * px}
                y={y * px}
                width={px}
                height={px}
                fill={COLOR_MAP[cell]}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
