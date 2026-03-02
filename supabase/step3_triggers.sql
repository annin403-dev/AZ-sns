-- ============================================================
-- ステップ3: トリガー関数
-- ※ $$ の代わりに $body$ を使用（LaTeX変換バグ回避）
-- ============================================================

-- updated_at 自動更新に moddatetime 拡張を使用
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- 新規ユーザー作成時にプロフィールを自動生成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $body$
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
$body$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  REFERENCING NEW TABLE AS inserted_rows
  FOR EACH STATEMENT EXECUTE FUNCTION public.handle_new_user();

-- タスク完了時に XP を加算
CREATE OR REPLACE FUNCTION public.handle_task_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $body$
BEGIN
  UPDATE public.profiles
  SET
    xp = xp + xp_reward,
    last_active_at = NOW()
  FROM (
    SELECT user_id, xp_reward
    FROM new_tasks
    WHERE is_completed = TRUE
      AND id IN (SELECT id FROM old_tasks WHERE is_completed = FALSE)
  ) AS task_updates
  WHERE id = user_id;

  RETURN NULL;
END;
$body$;

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
