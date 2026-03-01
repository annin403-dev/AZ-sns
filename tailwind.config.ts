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
        // ダークベース＋光のアクセント
        az: {
          bg: "#0a0a0f",          // 最深部の背景
          surface: "#12121a",     // カード・コンテナ背景
          border: "#1e1e2e",      // ボーダー
          muted: "#2a2a3d",       // ミュート背景
          text: "#e8e8f0",        // メインテキスト
          subtle: "#8888a8",      // サブテキスト
          gold: "#f0c060",        // 達成・報酬の金色
          glow: "#6060f0",        // 光のアクセント（紫青）
          aurora: "#40c0a0",      // 成長の緑
          flame: "#f06040",       // 情熱の赤橙
          mystic: "#c060f0",      // 神秘の紫
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
      animation: {
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "particle": "particle 1.5s ease-out forwards",
        "shine": "shine 0.5s ease-out forwards",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(96, 96, 240, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(96, 96, 240, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        particle: {
          "0%": { transform: "scale(0) translateY(0)", opacity: "1" },
          "100%": { transform: "scale(1) translateY(-100px)", opacity: "0" },
        },
        shine: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "gradient-mystic": "linear-gradient(135deg, #0a0a0f 0%, #12082a 50%, #0a0a0f 100%)",
        "gradient-aurora": "linear-gradient(135deg, #082a1a 0%, #0a1a2a 100%)",
        "gradient-gold": "linear-gradient(135deg, #f0c060 0%, #f08020 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
