# 持ち物（家族の持ち物管理アプリ）

家族5人の「衣類・消耗品・備蓄食品」を管理するスマホ向けWebアプリです。使い方と公開の手順は [SETUP.md](./SETUP.md) を見てください（やさしい日本語で書いています）。

## 構成

| 役割 | 使っているもの |
|---|---|
| 画面 | React 19 + Vite + Tailwind CSS v4（SPA） |
| サーバー | Cloudflare Workers + Hono（画面ファイルの配信と `/api` を1つのWorkerで担当） |
| データベース | Cloudflare D1（`migrations/` で管理。ORMは使わず prepared statement） |
| 入力チェック | zod（`shared/tables.ts`。サーバーで必ず検証） |
| ログイン | Cloudflare Access（One-time PIN）＋ Worker 側で `Cf-Access-Jwt-Assertion` を jose で検証 |
| テスト | vitest（`tests/`） |

```
worker/          Worker（Hono）。index.ts が API、auth.ts が Access の確認
shared/tables.ts テーブル定義・zod スキーマ・型（画面とサーバーで共通）
shared/logic/    判定ロジック（7章）。純粋な関数だけ
  season.ts      7-1 季節
  sizes.ts       7-2 サイズの提案 / 7-3 伸び方と次のサイズ
  clothing.ts    7-4 不足と「買わなくてOK」 / 7-5 お下がり判定 / 7-6 サイズが上がったとき
  supplies.ts    7-7 消耗品
  food.ts        7-8 備蓄の日数
  home.ts        ホームのまとめ・「買うもの」のテキスト
src/             画面（React）
  store.tsx      データの読み込み・保存・すぐ反映（失敗したら元に戻す）・元に戻す・−／＋のまとめ保存
  pages/         ホーム／持ち物／備蓄／家族／設定
  components/    編集シート、数え直し、メーター、はじめの案内
  csv.ts         CSV の書き出し・読み込み（列名は日本語）
migrations/      0001_init.sql（テーブル） / 0002_seed.sql（初期データ）
public/          favicon・PWA の manifest とアイコン
tests/           vitest
```

### API

すべて `/api/*`。Access の JWT がないと 401。

- `GET /api/all` … 全テーブルをまとめて返す（1家族分なので小さい）
- `POST /api/batch` … `{ ops: [{ table, op: 'insert'|'upsert'|'delete', row|key }] }` を D1 の batch（全部成功するか全部やめるか）で実行。テーブル名・列名はホワイトリスト、値は zod で検証してから bind
- `GET /api/backup` … 全データの JSON

画面側は `/api/all` を読み込み、判定（`shared/logic`）はブラウザで計算します。

### ログインの確認

- `ACCESS_TEAM_DOMAIN`（例 `yourteam.cloudflareaccess.com`）と `ACCESS_AUD` を `wrangler secret put` で登録。どちらかがなければ常に 401（閉じる側に倒す）
- `ALLOWED_EMAIL` を入れておくと、JWT のメールアドレスも照合（任意。二重の守り）
- `DEV_DISABLE_AUTH=true` は **ホスト名が localhost / 127.0.0.1 のときだけ** 効く。本番のホスト名では無視されるので、本番では無効にできない

## ローカルでの起動

```bash
npm install
cp .dev.vars.example .dev.vars          # ローカルだけ確認を省略
npx wrangler d1 migrations apply mochimono-db --local
npm run dev                              # http://localhost:5173
```

## マイグレーション

```bash
# 新しいマイグレーションを作る
npx wrangler d1 migrations create mochimono-db <名前>
# ローカル / 本番に当てる
npx wrangler d1 migrations apply mochimono-db --local
npx wrangler d1 migrations apply mochimono-db --remote
```

## テスト・型チェック

```bash
npm test          # vitest（判定ロジック・CSV・ログイン確認の省略条件）
npx tsc -b        # 型チェック
```

## 公開

```bash
npx wrangler login
npx wrangler d1 create mochimono-db      # 出てきた database_id を wrangler.jsonc に書く
npx wrangler d1 migrations apply mochimono-db --remote
npx wrangler secret put ACCESS_TEAM_DOMAIN
npx wrangler secret put ACCESS_AUD
npx wrangler secret put ALLOWED_EMAIL    # 任意
npm run deploy
```

Access の設定（ダッシュボードでの操作）は SETUP.md を見てください。
