/**
 * SeekerPixelArt
 *
 * ランディングページ用メインキャラクター。
 * - 頭上の星を見上げる人（成長・自己理解のメタファー）
 * - 10列×14行で顔を広げ、左目・右目を 2マス間隔で明確に分離
 * - 体に暗色を一切使わず「一つ目」に見えない設計
 *
 * カラーパレット:
 *   1 = #7C5CDB  髪（AZパープル）
 *   2 = #FDDBB0  肌
 *   3 = #B89EF0  服（薄紫）
 *   4 = #3A3A5C  目（濃紺）—顔行にのみ使用
 *   5 = #F5C842  星（ゴールド）
 */

const PIXEL_SIZE = 8; // 1ドット = 8px（scale倍率で拡大）

//  列:  0  1  2  3  4  5  6  7  8  9
//  ★ 目は col3=左目、col6=右目。間に col4・col5（肌）で2マスの空き。
//  ★ 体（row9〜13）には暗色ドット(4)を一切使わない。
const PIXELS: number[][] = [
  [0, 0, 0, 0, 5, 5, 0, 0, 0, 0],  // 星 上
  [0, 0, 0, 5, 5, 5, 5, 0, 0, 0],  // 星 中（横に広い）
  [0, 0, 0, 0, 5, 5, 0, 0, 0, 0],  // 星 下
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],  // 髪 上
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // 髪 下（横幅最大）
  [0, 2, 2, 2, 2, 2, 2, 2, 2, 0],  // 額
  [0, 2, 2, 4, 2, 2, 4, 2, 2, 0],  // 目行: col3=左目 / col6=右目
  [0, 2, 2, 2, 2, 2, 2, 2, 2, 0],  // 頬
  [0, 0, 2, 2, 2, 2, 2, 2, 0, 0],  // あご（やや細く）
  [0, 0, 3, 3, 3, 3, 3, 3, 0, 0],  // 肩・襟
  [0, 3, 3, 3, 3, 3, 3, 3, 3, 0],  // 上半身
  [0, 3, 3, 3, 3, 3, 3, 3, 3, 0],  // 腰
  [0, 3, 3, 0, 3, 3, 0, 3, 3, 0],  // 脚（隙間）
  [0, 3, 0, 0, 3, 3, 0, 0, 3, 0],  // 足先
];

const COLOR_MAP: Record<number, string> = {
  1: "#7C5CDB",
  2: "#FDDBB0",
  3: "#B89EF0",
  4: "#3A3A5C",
  5: "#F5C842",
};

interface SeekerPixelArtProps {
  scale?: number;
}

export function SeekerPixelArt({ scale = 1 }: SeekerPixelArtProps) {
  const px = PIXEL_SIZE * scale;
  const cols = 10;
  const rows = PIXELS.length;

  return (
    <div
      style={{
        display: "inline-block",
        filter: "drop-shadow(0 4px 16px rgba(124, 92, 219, 0.22))",
      }}
    >
      <svg
        width={px * cols}
        height={px * rows}
        viewBox={`0 0 ${px * cols} ${px * rows}`}
        shapeRendering="crispEdges"
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
