import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        az: {
          // ─── ベースカラー（明るい・やわらかい） ───
          bg: "#FAF9FF",        // ページ背景（薄いラベンダーホワイト）
          surface: "#FFFFFF",   // カード・コンテナ（白）
          surface2: "#F3F1FC",  // 少し沈んだカード（ホーム内セクション等）
          border: "#E8E4F8",    // ボーダー（薄い紫がかったグレー）
          muted: "#EDE9F9",     // ミュート背景（タグ・バッジ等）

          // ─── テキスト ───
          text: "#1C1A2E",      // メインテキスト（濃い紺）
          subtle: "#7B78A0",    // サブテキスト（ミュート紫グレー）

          // ─── ブランドカラー ───
          primary: "#7C5CDB",   // メインアクセント（バイオレット）
          "primary-light": "#EDE9F9", // プライマリの薄い版（背景等）

          // ─── ゲーム要素 ───
          gold: "#F5A623",      // Luck Lv・達成（アンバーゴールド）
          "gold-light": "#FEF5E4", // ゴールドの薄い版

          // ─── オーラ5色（タイプ別アクセント） ───
          // 挑戦：情熱の赤系
          aura1: "#F05252",
          "aura1-light": "#FEE8E8",
          // 安定：落ち着きのティール
          aura2: "#38B2AC",
          "aura2-light": "#E6F7F6",
          // 創造：想像の紫
          aura3: "#9060E0",
          "aura3-light": "#F0EAFC",
          // 探究：知性の青
          aura4: "#4090E0",
          "aura4-light": "#E8F2FD",
          // 奉仕：やさしい緑
          aura5: "#38C074",
          "aura5-light": "#E8F9EF",
        },
      },
      fontFamily: {
        sans: [
          "Hiragino Kaku Gothic ProN",
          "Hiragino Sans",
          "Noto Sans JP",
          "Meiryo",
          "sans-serif",
        ],
      },
      borderRadius: {
        // 角丸大きめがコンセプト
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        // やわらかい影（明るいテーマ向け）
        card: "0 2px 12px rgba(124, 92, 219, 0.08)",
        "card-hover": "0 4px 20px rgba(124, 92, 219, 0.14)",
        gold: "0 2px 12px rgba(245, 166, 35, 0.20)",
        aura: "0 2px 12px rgba(124, 92, 219, 0.20)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "bounce-soft": "bounceSoft 0.5s ease-out",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSoft: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "60%": { transform: "scale(1.03)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0px rgba(245, 166, 35, 0)" },
          "50%": { boxShadow: "0 0 16px rgba(245, 166, 35, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
