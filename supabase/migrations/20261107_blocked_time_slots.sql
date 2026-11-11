CREATE TABLE IF NOT EXISTS public.blocked_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blocked_time_slots_valid_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS blocked_time_slots_date_idx
  ON public.blocked_time_slots (date, start_time);