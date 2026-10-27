"use client";

import { useState } from "react";

/** 長い文章を表示して、ワンタップでコピーできる箱 */
export default function CopyBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 古いブラウザ向け：選択してコピー
      const el = document.getElementById("copy-box-text") as HTMLTextAreaElement | null;
      el?.select();
      document.execCommand("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card space-y-3">
      <textarea
        id="copy-box-text"
        readOnly
        value={text}
        rows={14}
        className="w-full p-3 rounded-xl text-sm leading-relaxed outline-none resize-none"
        style={{ background: "#F8F7FF", border: "1.5px solid #E8E4F8", color: "#1C1A2E" }}
      />
      <button onClick={handleCopy} className="btn-primary no-tap-highlight">
        {copied ? "✅ コピーしました" : "コピーする"}
      </button>
    </div>
  );
}
