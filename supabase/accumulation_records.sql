-- ============================================================
-- 積み上げ記録テーブル（積み上げ王 Type 02 機能）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.accumulation_records (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users NOT NULL,
  record_date  DATE        NOT NULL DEFAULT CURRENT_DATE,
  title        TEXT        NOT NULL,
  category     TEXT        NOT NULL DEFAULT 'habit'
                           CHECK (category IN ('skill','knowledge','network','habit','health','work','other')),
  minutes_spent INTEGER    DEFAULT 0,
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.accumulation_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accumulation records"
  ON public.accumulation_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accumulation records"
  ON public.accumulation_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accumulation records"
  ON public.accumulation_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accumulation records"
  ON public.accumulation_records FOR DELETE
  USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX IF NOT EXISTS accumulation_records_user_date
  ON public.accumulation_records(user_id, record_date DESC);
