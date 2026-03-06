-- ============================================================
-- AZ〜アズ〜 完全版スキーマ
-- ※ このSQLを1本丸ごとSupabaseのSQL Editorに貼り付けて実行してください
-- ※ 既存テーブルがあっても IF NOT EXISTS / OR REPLACE で安全に実行できます
-- ============================================================


-- ============================================================
-- PART 1: テーブル作成
-- ============================================================

-- プロフィールテーブル（auth.usersと連携）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  soul_type_id UUID,
  xp INTEGER DEFAULT 0 NOT NULL,
  streak_days INTEGER DEFAULT 0 NOT NULL,
  last_active_at TIMESTAMPTZ,
  -- AZタイプ診断結果
  job_type TEXT,
  aura_type TEXT,
  -- Luck Lv システム
  luck_lv INTEGER DEFAULT 1 NOT NULL,
  luck_xp INTEGER DEFAULT 0 NOT NULL,
  -- 今日のHP/MP（1-10の自己評価）
  hp INTEGER DEFAULT 7 NOT NULL,
  mp INTEGER DEFAULT 7 NOT NULL,
  -- 深掘り診断完了フラグ
  onboarding_done BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- すでに profiles が存在する場合のカラム追加（冪等）
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS aura_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS luck_lv INTEGER DEFAULT 1 NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS luck_xp INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hp INTEGER DEFAULT 7 NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mp INTEGER DEFAULT 7 NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE NOT NULL;

-- ソウルタイプテーブル（旧オンボーディング、互換保持）
CREATE TABLE IF NOT EXISTS public.soul_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  type_name TEXT DEFAULT '' NOT NULL,
  type_description TEXT DEFAULT '' NOT NULL,
  strengths TEXT[] DEFAULT '{}' NOT NULL,
  growth_direction TEXT DEFAULT '' NOT NULL,
  energy_sources TEXT[] DEFAULT '{}' NOT NULL,
  stop_triggers TEXT[] DEFAULT '{}' NOT NULL,
  motivation_type TEXT DEFAULT '' NOT NULL,
  goal_area TEXT DEFAULT '' NOT NULL,
  autonomy_score INTEGER DEFAULT 5 NOT NULL,
  competence_score INTEGER DEFAULT 5 NOT NULL,
  relatedness_score INTEGER DEFAULT 5 NOT NULL,
  is_complete BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- オンボーディング進捗テーブル
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_card INTEGER DEFAULT 0 NOT NULL,
  card_a_data JSONB,
  card_b_data JSONB,
  card_c_data JSONB,
  card_d_data JSONB,
  is_complete BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 目標テーブル（area の CHECK 制約をアプリの値に合わせて修正済み）
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  area TEXT NOT NULL CHECK (area IN ('work', 'health', 'learn', 'relation', 'money', 'life')),
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  progress INTEGER DEFAULT 0 NOT NULL CHECK (progress BETWEEN 0 AND 100),
  -- v2追加カラム
  yearly_goal TEXT DEFAULT '',
  monthly_goal TEXT DEFAULT '',
  weekly_goal TEXT DEFAULT '',
  min_action TEXT DEFAULT '',
  win_context TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- すでに goals が存在する場合のカラム追加（冪等）
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS yearly_goal TEXT DEFAULT '';
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS monthly_goal TEXT DEFAULT '';
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS weekly_goal TEXT DEFAULT '';
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS min_action TEXT DEFAULT '';
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS win_context TEXT DEFAULT '';

-- タスクテーブル（旧機能、互換保持）
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_minutes INTEGER DEFAULT 2 NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at TIMESTAMPTZ,
  scheduled_date DATE NOT NULL,
  xp_reward INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 投稿テーブル
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 300),
  post_type TEXT DEFAULT 'insight' NOT NULL CHECK (post_type IN ('insight', 'progress', 'task_complete', 'emotion')),
  visibility TEXT DEFAULT 'public' NOT NULL CHECK (visibility IN ('public', 'circle', 'private')),
  image_url TEXT,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- リアクションテーブル
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('empathy', 'helpful', 'cheer')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, post_id, reaction_type)
);

-- 感情ログ（旧テーブル、互換保持）
CREATE TABLE IF NOT EXISTS public.emotion_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emotion TEXT NOT NULL,
  intensity INTEGER DEFAULT 5 NOT NULL CHECK (intensity BETWEEN 1 AND 10),
  context TEXT,
  ai_reframe TEXT,
  is_private BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 詰まり記録テーブル
CREATE TABLE IF NOT EXISTS public.stuck_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  situation TEXT NOT NULL,
  emotion TEXT NOT NULL,
  auto_thought TEXT NOT NULL,
  alternative_view TEXT NOT NULL,
  next_action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AIコーチ会話テーブル
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- フォローテーブル
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- バッジテーブル
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, badge_type)
);

-- コミュニティテーブル
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  goal_area TEXT NOT NULL,
  member_count INTEGER DEFAULT 0 NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- PART 2: v2 新規テーブル
-- ============================================================

-- az_profiles（深掘り診断の成果物）
CREATE TABLE IF NOT EXISTS public.az_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  job_type TEXT NOT NULL DEFAULT '',
  aura_type TEXT NOT NULL DEFAULT '',
  type_key TEXT NOT NULL DEFAULT '',
  propellant_map JSONB DEFAULT '{}',
  blocker_map JSONB DEFAULT '{}',
  winning_condition JSONB DEFAULT '{}',
  self_definition TEXT DEFAULT '',
  no_list TEXT[] DEFAULT '{}',
  yearly_goal TEXT DEFAULT '',
  monthly_goal TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- wish_items（Wish Map）
CREATE TABLE IF NOT EXISTS public.wish_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('recovery', 'want_to_do', 'want_to_have')),
  title TEXT NOT NULL,
  memo TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'private' NOT NULL CHECK (visibility IN ('private', 'friends', 'public')),
  is_fulfilled BOOLEAN DEFAULT FALSE NOT NULL,
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- emotion_logs_v2（感情ログ + Three Good Things）
CREATE TABLE IF NOT EXISTS public.emotion_logs_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood TEXT NOT NULL DEFAULT 'neutral',
  hp_value INTEGER NOT NULL DEFAULT 7 CHECK (hp_value BETWEEN 1 AND 10),
  mp_value INTEGER NOT NULL DEFAULT 7 CHECK (mp_value BETWEEN 1 AND 10),
  emotion_tags TEXT[] DEFAULT '{}',
  memo TEXT DEFAULT '',
  good_things TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- quests（今日のクエスト）
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  context TEXT DEFAULT '',
  is_done BOOLEAN DEFAULT FALSE NOT NULL,
  done_at TIMESTAMPTZ,
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  luck_xp_reward INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- luck_events（Luck Lv 変化ログ）
CREATE TABLE IF NOT EXISTS public.luck_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'quest_done', 'emotion_log', 'three_good_things',
    'cheer', 'deep_diagnosis', 'wish_added', 'login_streak'
  )),
  xp_gained INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ============================================================
-- PART 3: インデックス
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON public.tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_user_id ON public.emotion_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_wish_items_user_id ON public.wish_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wish_items_category ON public.wish_items(category);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_v2_user_id ON public.emotion_logs_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_v2_log_date ON public.emotion_logs_v2(log_date);
CREATE INDEX IF NOT EXISTS idx_quests_user_id ON public.quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_scheduled_date ON public.quests(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_luck_events_user_id ON public.luck_events(user_id);


-- ============================================================
-- PART 4: RLS（Row Level Security）
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stuck_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.az_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wish_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_logs_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.luck_events ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "プロフィールは全員が閲覧可能" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "自分のプロフィールのみ作成可能" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "自分のプロフィールのみ更新可能" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- soul_types
CREATE POLICY "ソウルタイプは全員が閲覧可能" ON public.soul_types FOR SELECT USING (true);
CREATE POLICY "自分のソウルタイプのみ作成可能" ON public.soul_types FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のソウルタイプのみ更新可能" ON public.soul_types FOR UPDATE USING (auth.uid() = user_id);

-- onboarding_progress
CREATE POLICY "自分の進捗のみ閲覧可能" ON public.onboarding_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分の進捗のみ作成可能" ON public.onboarding_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分の進捗のみ更新可能" ON public.onboarding_progress FOR UPDATE USING (auth.uid() = user_id);

-- goals
CREATE POLICY "目標は全員が閲覧可能" ON public.goals FOR SELECT USING (true);
CREATE POLICY "ログイン済みユーザーのみ目標作成可能" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分の目標のみ更新可能" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "自分の目標のみ削除可能" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- tasks
CREATE POLICY "自分のタスクのみ閲覧可能" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分のタスクのみ作成可能" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のタスクのみ更新可能" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "自分のタスクのみ削除可能" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- posts
CREATE POLICY "公開投稿は全員が閲覧可能" ON public.posts FOR SELECT USING (
  visibility = 'public' OR auth.uid() = user_id
);
CREATE POLICY "ログイン済みユーザーのみ投稿可能" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分の投稿のみ更新可能" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "自分の投稿のみ削除可能" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- reactions
CREATE POLICY "リアクションは全員が閲覧可能" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "ログイン済みユーザーのみリアクション可能" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のリアクションのみ削除可能" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- emotion_logs（旧）
CREATE POLICY "自分の感情ログのみ閲覧可能" ON public.emotion_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分の感情ログのみ作成可能" ON public.emotion_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分の感情ログのみ更新可能" ON public.emotion_logs FOR UPDATE USING (auth.uid() = user_id);

-- stuck_records
CREATE POLICY "自分の詰まり記録のみ閲覧可能" ON public.stuck_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分の詰まり記録のみ作成可能" ON public.stuck_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ai_conversations
CREATE POLICY "自分の会話のみ閲覧可能" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分の会話のみ作成可能" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- follows
CREATE POLICY "フォロー関係は全員が閲覧可能" ON public.follows FOR SELECT USING (true);
CREATE POLICY "ログイン済みユーザーのみフォロー可能" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "自分のフォローのみ削除可能" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- badges
CREATE POLICY "バッジは全員が閲覧可能" ON public.badges FOR SELECT USING (true);
CREATE POLICY "バッジはシステムのみ付与可能" ON public.badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- communities
CREATE POLICY "コミュニティは全員が閲覧可能" ON public.communities FOR SELECT USING (true);

-- az_profiles
CREATE POLICY "自分のaz_profileのみ閲覧" ON public.az_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分のaz_profileのみ作成" ON public.az_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のaz_profileのみ更新" ON public.az_profiles FOR UPDATE USING (auth.uid() = user_id);

-- wish_items
CREATE POLICY "公開Wishは全員閲覧可" ON public.wish_items FOR SELECT USING (
  visibility = 'public' OR auth.uid() = user_id
);
CREATE POLICY "自分のWishのみ作成" ON public.wish_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のWishのみ更新" ON public.wish_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "自分のWishのみ削除" ON public.wish_items FOR DELETE USING (auth.uid() = user_id);

-- emotion_logs_v2
CREATE POLICY "自分の感情ログのみ閲覧" ON public.emotion_logs_v2 FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分の感情ログのみ作成" ON public.emotion_logs_v2 FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分の感情ログのみ更新" ON public.emotion_logs_v2 FOR UPDATE USING (auth.uid() = user_id);

-- quests
CREATE POLICY "自分のクエストのみ閲覧" ON public.quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分のクエストのみ作成" ON public.quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のクエストのみ更新" ON public.quests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "自分のクエストのみ削除" ON public.quests FOR DELETE USING (auth.uid() = user_id);

-- luck_events
CREATE POLICY "自分のLuckイベントのみ閲覧" ON public.luck_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分のLuckイベントのみ作成" ON public.luck_events FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- PART 5: トリガー関数の定義
-- ============================================================

-- updated_at を自動更新する関数（handle_updated_at）
-- ※ schema-v2.sql が依存していた関数。ここで定義します。
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 新規ユーザー登録時にプロフィールを自動作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.onboarding_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- クエスト完了時に Luck XP を付与
CREATE OR REPLACE FUNCTION public.handle_quest_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_done = TRUE AND OLD.is_done = FALSE THEN
    INSERT INTO public.luck_events (user_id, event_type, xp_gained)
    VALUES (NEW.user_id, 'quest_done', NEW.luck_xp_reward);

    UPDATE public.profiles
    SET luck_xp = luck_xp + NEW.luck_xp_reward,
        last_active_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Luck XP が 100 貯まるごとに Luck Lv +1
CREATE OR REPLACE FUNCTION public.handle_luck_levelup()
RETURNS TRIGGER AS $$
DECLARE
  new_lv INTEGER;
BEGIN
  new_lv := FLOOR(NEW.luck_xp / 100) + 1;
  IF new_lv > OLD.luck_lv THEN
    NEW.luck_lv := new_lv;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- タスク完了時に XP を付与（旧機能、互換保持）
CREATE OR REPLACE FUNCTION public.handle_task_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    UPDATE public.profiles
    SET xp = xp + NEW.xp_reward,
        last_active_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- PART 6: トリガーの設定
-- ============================================================

-- ユーザー登録トリガー
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- updated_at 自動更新
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_onboarding_updated ON public.onboarding_progress;
CREATE TRIGGER on_onboarding_updated
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_goal_updated ON public.goals;
CREATE TRIGGER on_goal_updated
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_post_updated ON public.posts;
CREATE TRIGGER on_post_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_az_profile_updated ON public.az_profiles;
CREATE TRIGGER on_az_profile_updated
  BEFORE UPDATE ON public.az_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- クエスト完了トリガー
DROP TRIGGER IF EXISTS on_quest_completed ON public.quests;
CREATE TRIGGER on_quest_completed
  AFTER UPDATE ON public.quests
  FOR EACH ROW EXECUTE PROCEDURE public.handle_quest_complete();

-- Luck Lv アップトリガー
DROP TRIGGER IF EXISTS on_luck_xp_updated ON public.profiles;
CREATE TRIGGER on_luck_xp_updated
  BEFORE UPDATE OF luck_xp ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_luck_levelup();

-- タスク完了トリガー（旧機能）
DROP TRIGGER IF EXISTS on_task_completed ON public.tasks;
CREATE TRIGGER on_task_completed
  AFTER UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_task_complete();
