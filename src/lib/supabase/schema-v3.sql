-- ============================================================
-- AZ スキーマ v3.0 - 「良い依存」機能（Phase 3）
-- ============================================================
-- ※ schema-complete.sql（または v1 + v2）の後に実行してください
-- ※ 何度実行してもエラーにならないように書いています
-- ============================================================

-- ============================================================
-- 1. roadmaps テーブル
--    90日ロードマップ（AIが生成したマイクロステップ計画）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  goal TEXT NOT NULL,
  current_state TEXT DEFAULT '',
  brake_type TEXT,                         -- fear / perfection / wound / empty
  minutes_per_day INTEGER DEFAULT 5 NOT NULL,
  plan JSONB NOT NULL DEFAULT '{}',        -- phases / if_then / first_step / vision
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 2. brain_dumps テーブル
--    モヤモヤの吐き出し + AZによる整理結果（完全非公開）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.brain_dumps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  result JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 3. if_then_plans テーブル
--    「もし〇〇したら、〇〇する」の実行計画
-- ============================================================
CREATE TABLE IF NOT EXISTS public.if_then_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  trigger_text TEXT NOT NULL,
  action_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  done_count INTEGER DEFAULT 0 NOT NULL,
  last_done_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 4. efficacy_checks テーブル
--    自己効力感スコア（「脳の成長グラフ」用、1〜10）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.efficacy_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, check_date)
);

-- ============================================================
-- インデックス
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_brain_dumps_user_id ON public.brain_dumps(user_id);
CREATE INDEX IF NOT EXISTS idx_if_then_plans_user_id ON public.if_then_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_efficacy_checks_user_id ON public.efficacy_checks(user_id);

-- ============================================================
-- RLS（すべて本人のみ）
-- ============================================================
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_dumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.if_then_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.efficacy_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "自分のロードマップのみ" ON public.roadmaps;
CREATE POLICY "自分のロードマップのみ" ON public.roadmaps
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "自分のブレインダンプのみ" ON public.brain_dumps;
CREATE POLICY "自分のブレインダンプのみ" ON public.brain_dumps
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "自分のIf-Thenのみ" ON public.if_then_plans;
CREATE POLICY "自分のIf-Thenのみ" ON public.if_then_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "自分の自己効力感のみ" ON public.efficacy_checks;
CREATE POLICY "自分の自己効力感のみ" ON public.efficacy_checks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
