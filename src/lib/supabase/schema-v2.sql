-- ============================================================
-- AZ スキーマ v2.0 - 変更・追加分
-- ============================================================
-- ※ このファイルは既存のschema.sqlに追加で実行してください
-- ※ Supabaseのダッシュボード → SQL Editor で実行
-- ============================================================

-- ============================================================
-- 1. profiles テーブルの拡張
--    （既存テーブルに新しいカラムを追加）
-- ============================================================
ALTER TABLE public.profiles
  -- AZタイプ診断の結果
  ADD COLUMN IF NOT EXISTS job_type TEXT,
  ADD COLUMN IF NOT EXISTS aura_type TEXT,
  -- Luck Lv システム
  ADD COLUMN IF NOT EXISTS luck_lv INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS luck_xp INTEGER DEFAULT 0 NOT NULL,
  -- 今日のHP/MP（1-10の自己評価）
  ADD COLUMN IF NOT EXISTS hp INTEGER DEFAULT 7 NOT NULL,
  ADD COLUMN IF NOT EXISTS mp INTEGER DEFAULT 7 NOT NULL,
  -- オンボーディング完了フラグ（既存のsoul_typesから移行）
  ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE NOT NULL;

-- ============================================================
-- 2. az_profiles テーブル
--    深掘り診断の成果物を保存
-- ============================================================
CREATE TABLE IF NOT EXISTS public.az_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- AZタイプ診断結果
  job_type TEXT NOT NULL DEFAULT '',
  aura_type TEXT NOT NULL DEFAULT '',
  type_key TEXT NOT NULL DEFAULT '',   -- "Pioneer_挑戦" のような結合キー

  -- 深掘り診断の成果物（JSONB = 柔軟な構造のデータ保存）
  propellant_map JSONB DEFAULT '{}',    -- 推進剤マップ
  blocker_map JSONB DEFAULT '{}',       -- 停止装置マップ
  winning_condition JSONB DEFAULT '{}', -- 勝てる条件マップ

  -- 自己定義
  self_definition TEXT DEFAULT '',      -- 自分についての一文
  no_list TEXT[] DEFAULT '{}',          -- やらないこと3つ

  -- 年間・月間目標
  yearly_goal TEXT DEFAULT '',
  monthly_goal TEXT DEFAULT '',

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 3. wish_items テーブル
--    Wish Map の望みのカケラ
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wish_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- カテゴリ（3種類）
  category TEXT NOT NULL CHECK (
    category IN ('recovery', 'want_to_do', 'want_to_have')
  ),
  -- 'recovery'    = 回復（やりたくないこと / 休みたいこと）
  -- 'want_to_do'  = やりたいこと
  -- 'want_to_have'= 欲しいもの

  title TEXT NOT NULL,
  memo TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',

  -- 公開設定
  visibility TEXT DEFAULT 'private' NOT NULL CHECK (
    visibility IN ('private', 'friends', 'public')
  ),

  -- 叶ったかどうか
  is_fulfilled BOOLEAN DEFAULT FALSE NOT NULL,
  fulfilled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 4. emotion_logs テーブル（既存テーブルを置き換え）
--    感情ログ + Three Good Things をまとめて保存
-- ============================================================
CREATE TABLE IF NOT EXISTS public.emotion_logs_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- 日付（同じ日に複数回入力できる）
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- 気分（絵文字スラッグ）
  -- 例: "great" / "good" / "neutral" / "tired" / "rough"
  mood TEXT NOT NULL DEFAULT 'neutral',

  -- HP/MP 自己評価（1-10）
  hp_value INTEGER NOT NULL DEFAULT 7 CHECK (hp_value BETWEEN 1 AND 10),
  mp_value INTEGER NOT NULL DEFAULT 7 CHECK (mp_value BETWEEN 1 AND 10),

  -- 感情タグ（複数選択可）
  emotion_tags TEXT[] DEFAULT '{}',

  -- 一言メモ
  memo TEXT DEFAULT '',

  -- Three Good Things（今日の良かったこと、1〜3個）
  good_things TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 5. quests テーブル
--    今日のクエスト（最小行動）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- 関連する目標（任意）
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  context TEXT DEFAULT '',  -- 「〇〇の時に」という文脈メモ

  -- 完了状態
  is_done BOOLEAN DEFAULT FALSE NOT NULL,
  done_at TIMESTAMPTZ,

  -- 実行予定日
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Luck Lv 報酬
  luck_xp_reward INTEGER DEFAULT 10 NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 6. luck_events テーブル
--    Luck Lv の変化ログ
-- ============================================================
CREATE TABLE IF NOT EXISTS public.luck_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- イベント種別
  event_type TEXT NOT NULL CHECK (event_type IN (
    'quest_done',          -- クエスト達成
    'emotion_log',         -- 感情ログ記入
    'three_good_things',   -- Three Good Things
    'cheer',               -- 応援
    'deep_diagnosis',      -- 深掘り診断完了
    'wish_added',          -- Wish Map追加
    'login_streak'         -- ログイン継続
  )),

  xp_gained INTEGER NOT NULL DEFAULT 10,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 7. goals テーブルの拡張（既存テーブルに追加）
-- ============================================================
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS yearly_goal TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS monthly_goal TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS weekly_goal TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS min_action TEXT DEFAULT '',   -- 今日の最小行動
  ADD COLUMN IF NOT EXISTS win_context TEXT DEFAULT '';  -- 勝てる文脈

-- ============================================================
-- インデックス（検索を速くするための設定）
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_wish_items_user_id ON public.wish_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wish_items_category ON public.wish_items(category);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_v2_user_id ON public.emotion_logs_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_v2_log_date ON public.emotion_logs_v2(log_date);
CREATE INDEX IF NOT EXISTS idx_quests_user_id ON public.quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_scheduled_date ON public.quests(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_luck_events_user_id ON public.luck_events(user_id);

-- ============================================================
-- RLS（セキュリティ設定）
--    Row Level Security = 「自分のデータしか見られない」仕組み
-- ============================================================
ALTER TABLE public.az_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wish_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_logs_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.luck_events ENABLE ROW LEVEL SECURITY;

-- az_profiles
CREATE POLICY "自分のaz_profileのみ閲覧" ON public.az_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分のaz_profileのみ作成" ON public.az_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のaz_profileのみ更新" ON public.az_profiles FOR UPDATE USING (auth.uid() = user_id);

-- wish_items（公開設定に応じたアクセス制御）
CREATE POLICY "公開Wishは全員閲覧可" ON public.wish_items FOR SELECT USING (
  visibility = 'public' OR auth.uid() = user_id
);
CREATE POLICY "自分のWishのみ作成" ON public.wish_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のWishのみ更新" ON public.wish_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "自分のWishのみ削除" ON public.wish_items FOR DELETE USING (auth.uid() = user_id);

-- emotion_logs_v2（完全非公開）
CREATE POLICY "自分の感情ログのみ閲覧" ON public.emotion_logs_v2 FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分の感情ログのみ作成" ON public.emotion_logs_v2 FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分の感情ログのみ更新" ON public.emotion_logs_v2 FOR UPDATE USING (auth.uid() = user_id);

-- quests（完全非公開）
CREATE POLICY "自分のクエストのみ閲覧" ON public.quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分のクエストのみ作成" ON public.quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のクエストのみ更新" ON public.quests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "自分のクエストのみ削除" ON public.quests FOR DELETE USING (auth.uid() = user_id);

-- luck_events（完全非公開）
CREATE POLICY "自分のLuckイベントのみ閲覧" ON public.luck_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分のLuckイベントのみ作成" ON public.luck_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- トリガー関数の追加
-- ============================================================

-- az_profilesのupdated_atを自動更新
CREATE TRIGGER on_az_profile_updated
  BEFORE UPDATE ON public.az_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- クエスト完了時にLuck XPを付与
CREATE OR REPLACE FUNCTION public.handle_quest_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_done = TRUE AND OLD.is_done = FALSE THEN
    -- luck_eventsにログを追加
    INSERT INTO public.luck_events (user_id, event_type, xp_gained)
    VALUES (NEW.user_id, 'quest_done', NEW.luck_xp_reward);

    -- profilesのluck_xpを更新
    UPDATE public.profiles
    SET luck_xp = luck_xp + NEW.luck_xp_reward,
        last_active_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_quest_completed
  AFTER UPDATE ON public.quests
  FOR EACH ROW EXECUTE PROCEDURE public.handle_quest_complete();

-- Luck XPが一定値に達したらLuck Lvを上げる
-- （100XPごとに1Lv上昇）
CREATE OR REPLACE FUNCTION public.handle_luck_levelup()
RETURNS TRIGGER AS $$
DECLARE
  new_lv INTEGER;
BEGIN
  -- 100XP = 1Lv
  new_lv := FLOOR(NEW.luck_xp / 100) + 1;
  IF new_lv > OLD.luck_lv THEN
    NEW.luck_lv := new_lv;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_luck_xp_updated
  BEFORE UPDATE OF luck_xp ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_luck_levelup();
