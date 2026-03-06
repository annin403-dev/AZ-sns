# AZ アプリ — デプロイ＆スキーマ適用ガイド

## STEP 1: Supabase スキーマ v2 を適用する

> ⚠️ **まずここから始めてください。スキーマを適用しないとアプリが動きません。**

### 手順

1. [Supabase ダッシュボード](https://supabase.com/dashboard) を開く
2. AZプロジェクトを選択
3. 左メニューの **「SQL Editor」** をクリック
4. **「New query」** ボタンをクリック
5. 下記の SQL をすべてコピーして貼り付ける
6. **「Run」** ボタンをクリック
7. 「Success. No rows returned」が出れば完了 ✅

### 貼り付けるSQL（`src/lib/supabase/schema-v2.sql` の内容）

```sql
-- AZ スキーマ v2 追加分（既存schema.sqlの後に実行）

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS job_type TEXT,
  ADD COLUMN IF NOT EXISTS aura_type TEXT,
  ADD COLUMN IF NOT EXISTS luck_lv INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS luck_xp INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS hp INTEGER DEFAULT 7 NOT NULL,
  ADD COLUMN IF NOT EXISTS mp INTEGER DEFAULT 7 NOT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE NOT NULL;

-- ～（略: schema-v2.sql 全文を貼り付ける）
```

> **ファイルの場所**: `src/lib/supabase/schema-v2.sql`
> → VS Code や任意のエディタで開いて、内容をすべてコピーしてください。

---

## STEP 2: Vercel にデプロイする

### 2-1. Vercelアカウントを用意する

1. [vercel.com](https://vercel.com) でアカウント作成（GitHubアカウントでログイン推奨）

### 2-2. プロジェクトをインポートする

1. Vercelダッシュボードで **「Add New Project」** をクリック
2. **「Import Git Repository」** から `annin403-dev/AZ-sns` を選択
3. **「Import」** をクリック

### 2-3. 環境変数を設定する

「Configure Project」画面の **Environment Variables** に以下を追加：

| 変数名 | 値の取得場所 |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |

### 2-4. デプロイする

1. **「Deploy」** をクリック
2. 1〜2分待つ
3. `https://az-sns-xxxx.vercel.app` のようなURLが発行される ✅

---

## STEP 3: 確認URL一覧

デプロイ後、以下のURLで各ページを確認できます：

| ページ | URL |
|--------|-----|
| トップ（ランディング） | `https://[your-domain]/` |
| AZタイプ診断（12問） | `https://[your-domain]/diagnosis` |
| 診断結果 | `https://[your-domain]/diagnosis/result` |
| 新規登録 | `https://[your-domain]/register` |
| ログイン | `https://[your-domain]/login` |
| ホーム | `https://[your-domain]/home` |
| 診断メニュー | `https://[your-domain]/diagnosis/menu` |
| 深掘り診断 | `https://[your-domain]/onboarding` |
| クエスト追加 | `https://[your-domain]/quests/new` |
| 目標追加 | `https://[your-domain]/goals/new` |
| マイページ | `https://[your-domain]/mypage` |
| Wish Map | `https://[your-domain]/wishmap` |

---

## チェックすべき動線（優先順位順）

1. **診断→登録の連携**
   `/diagnosis` → 12問回答 → `/diagnosis/result` → 「登録して保存」→ `/register?type=XXX&aura=YYY`
   → 登録後、Supabaseの `profiles` テーブルに `job_type` と `aura_type` が入っているか確認

2. **深掘り診断の完了**
   `/onboarding` → 6カード回答 → 完了 → `/home` にリダイレクト
   → `az_profiles` テーブルにデータが保存されているか確認

3. **クエスト完了でLuck XP増加**
   `/quests/new` でクエスト追加 → ホームでチェックマーク → `profiles.luck_xp` が増えているか確認

---

## トラブルシューティング

| エラー | 対処法 |
|--------|--------|
| 「テーブルが存在しません」 | STEP 1のスキーマ適用が未実施 → SQL Editorで再実行 |
| 環境変数エラー（500） | Vercelの環境変数が未設定 → Settings → Environment Variables |
| ログインできない | Supabaseの Authentication → URL Configuration → Site URL を Vercel URLに変更 |
| リダイレクトエラー | Supabase → Auth → URL Configuration → Redirect URLs に `https://[vercel-url]/**` を追加 |
