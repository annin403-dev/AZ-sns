-- ============================================================
-- ステップ3: トリガー関数
-- ※ NEW./OLD. を使わず、遷移テーブルと moddatetime を使用
-- ============================================================

-- updated_at 自動更新に moddatetime 拡張を使用
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- 新規ユーザー作成時にプロフィールを自動生成
-- （遷移テーブル "inserted_rows" を使い NEW. を回避）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  SELECT
    id,
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'display_name',
             COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)))
  FROM inserted_rows;

  INSERT INTO public.onboarding_progress (user_id)
  SELECT id FROM inserted_rows;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  REFERENCING NEW TABLE AS inserted_rows
  FOR EACH STATEMENT EXECUTE FUNCTION public.handle_new_user();

-- タスク完了時に XP を加算
-- （遷移テーブル "new_tasks"/"old_tasks" を使い NEW./OLD. を回避）
CREATE OR REPLACE FUNCTION public.handle_task_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles p
  SET
    xp = p.xp + n.xp_reward,
    last_active_at = NOW()
  FROM new_tasks n
  JOIN old_tasks o ON n.id = o.id
  WHERE n.is_completed = TRUE
    AND o.is_completed = FALSE
    AND p.id = n.user_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_task_completed ON public.tasks;
CREATE TRIGGER on_task_completed
  AFTER UPDATE ON public.tasks
  REFERENCING NEW TABLE AS new_tasks OLD TABLE AS old_tasks
  FOR EACH STATEMENT EXECUTE FUNCTION public.handle_task_complete();

-- updated_at 自動更新トリガー（moddatetime 拡張を使用）
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime(updated_at);

DROP TRIGGER IF EXISTS on_onboarding_updated ON public.onboarding_progress;
CREATE TRIGGER on_onboarding_updated
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime(updated_at);

DROP TRIGGER IF EXISTS on_goal_updated ON public.goals;
CREATE TRIGGER on_goal_updated
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime(updated_at);

DROP TRIGGER IF EXISTS on_post_updated ON public.posts;
CREATE TRIGGER on_post_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime(updated_at);
