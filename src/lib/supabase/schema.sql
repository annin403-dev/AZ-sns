-- ============================================================
-- AZ〜アズ〜 自己成長型SNS データベーススキーマ v2.0
-- Supabaseのダッシュボード（SQL Editor）で実行してください
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
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ソウルタイプテーブル（オンボーディング診断結果）
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

-- オンボーディング進捗テーブル（途中再開対応）
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

-- 目標テーブル
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  area TEXT NOT NULL CHECK (area IN ('work', 'learning', 'creation', 'health', 'relationship')),
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  progress INTEGER DEFAULT 0 NOT NULL CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- タスクテーブル（光のタスク）
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

-- リアクションテーブル（共感/参考/応援の3種）
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('empathy', 'helpful', 'cheer')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, post_id, reaction_type)
);

-- 感情ログテーブル（感情の錬金術）
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

-- 詰まり記録テーブル（Thought Recordフロー）
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

-- バッジテーブル（ゲーミフィケーション）
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, badge_type)
);

-- コミュニティテーブル（サークル機能）
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
-- インデックスの作成
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

-- ============================================================
-- RLS（Row Level Security）の有効化
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

-- ============================================================
-- RLSポリシー
-- ============================================================

-- プロフィール
CREATE POLICY "プロフィールは全員が閲覧可能" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "自分のプロフィールのみ作成可能" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "自分のプロフィールのみ更新可能" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ソウルタイプ
CREATE POLICY "ソウルタイプは全員が閲覧可能" ON public.soul_types FOR SELECT USING (true);
CREATE POLICY "自分のソウルタイプのみ作成可能" ON public.soul_types FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のソウルタイプのみ更新可能" ON public.soul_types FOR UPDATE USING (auth.uid() = user_id);

-- オンボーディング進捗
CREATE POLICY "自分の進捗のみ閲覧可能" ON public.onboarding_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分の進捗のみ作成可能" ON public.onboarding_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分の進捗のみ更新可能" ON public.onboarding_progress FOR UPDATE USING (auth.uid() = user_id);

-- 目標
CREATE POLICY "目標は全員が閲覧可能" ON public.goals FOR SELECT USING (true);
CREATE POLICY "ログイン済みユーザーのみ目標作成可能" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分の目標のみ更新可能" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "自分の目標のみ削除可能" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- タスク
CREATE POLICY "自分のタスクのみ閲覧可能" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分のタスクのみ作成可能" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のタスクのみ更新可能" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "自分のタスクのみ削除可能" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- 投稿（公開範囲に応じたアクセス制御）
CREATE POLICY "公開投稿は全員が閲覧可能" ON public.posts FOR SELECT USING (
  visibility = 'public' OR auth.uid() = user_id
);
CREATE POLICY "ログイン済みユーザーのみ投稿可能" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分の投稿のみ更新可能" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "自分の投稿のみ削除可能" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- リアクション
CREATE POLICY "リアクションは全員が閲覧可能" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "ログイン済みユーザーのみリアクション可能" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のリアクションのみ削除可能" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- 感情ログ（完全非公開）
CREATE POLICY "自分の感情ログのみ閲覧可能" ON public.emotion_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分の感情ログのみ作成可能" ON public.emotion_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分の感情ログのみ更新可能" ON public.emotion_logs FOR UPDATE USING (auth.uid() = user_id);

-- 詰まり記録（完全非公開）
CREATE POLICY "自分の詰まり記録のみ閲覧可能" ON public.stuck_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分の詰まり記録のみ作成可能" ON public.stuck_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AIコーチ会話（完全非公開）
CREATE POLICY "自分の会話のみ閲覧可能" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分の会話のみ作成可能" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- フォロー
CREATE POLICY "フォロー関係は全員が閲覧可能" ON public.follows FOR SELECT USING (true);
CREATE POLICY "ログイン済みユーザーのみフォロー可能" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "自分のフォローのみ削除可能" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- バッジ
CREATE POLICY "バッジは全員が閲覧可能" ON public.badges FOR SELECT USING (true);
CREATE POLICY "バッジはシステムのみ付与可能" ON public.badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- コミュニティ
CREATE POLICY "コミュニティは全員が閲覧可能" ON public.communities FOR SELECT USING (true);

-- ============================================================
-- トリガー関数
-- ============================================================

-- 新規ユーザー登録時にプロフィールを自動作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  -- オンボーディング進捗を初期化
  INSERT INTO public.onboarding_progress (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- updated_atを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_onboarding_updated BEFORE UPDATE ON public.onboarding_progress FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_goal_updated BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_post_updated BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- タスク完了時にXPを付与するトリガー
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

CREATE TRIGGER on_task_completed AFTER UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.handle_task_complete();
