"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/settings";
import { logout } from "@/app/actions/auth";

/** プロフィール編集とログアウト */
export default function SettingsForm({
  email,
  username,
  displayName,
  bio,
}: {
  email: string;
  username: string;
  displayName: string;
  bio: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [text, setText] = useState(bio);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const res = await updateProfile(name, text).catch(() => ({ error: "通信に失敗しました" }));
    setSaving(false);
    if ("error" in res && res.error) {
      setMessage({ ok: false, text: res.error });
      return;
    }
    setMessage({ ok: true, text: "保存しました" });
    router.refresh();
  }

  return (
    <>
      <div className="card space-y-4">
        <p className="text-sm font-bold" style={{ color: "#1C1A2E" }}>
          プロフィール
        </p>
        <div>
          <p className="text-xs mb-1" style={{ color: "#7B78A0" }}>メールアドレス</p>
          <p className="text-sm" style={{ color: "#1C1A2E" }}>{email}</p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: "#7B78A0" }}>ユーザー名</p>
          <p className="text-sm" style={{ color: "#1C1A2E" }}>@{username}</p>
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "#7B78A0" }}>表示名</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "#F8F7FF", border: "1.5px solid #E8E4F8", color: "#1C1A2E" }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "#7B78A0" }}>ひとこと紹介（任意）</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={160}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ background: "#F8F7FF", border: "1.5px solid #E8E4F8", color: "#1C1A2E" }}
          />
        </div>
        {message && (
          <p className="text-sm" style={{ color: message.ok ? "#38C074" : "#F05252" }}>
            {message.text}
          </p>
        )}
        <button onClick={handleSave} disabled={saving} className="btn-primary no-tap-highlight">
          {saving ? "保存中…" : "保存する"}
        </button>
      </div>

      <form action={logout}>
        <button type="submit" className="w-full py-4 rounded-2xl text-base font-semibold no-tap-highlight"
          style={{ background: "#FFFFFF", border: "1.5px solid #F5C2C2", color: "#F05252" }}>
          ログアウト
        </button>
      </form>
    </>
  );
}
