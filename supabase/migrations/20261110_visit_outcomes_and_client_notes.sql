ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS visit_outcome text;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_visit_outcome_check
  CHECK (visit_outcome IS NULL OR visit_outcome IN ('completed', 'no_show'));

CREATE TABLE IF NOT EXISTS public.client_private_notes (
  email text PRIMARY KEY,
  note text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_private_notes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.client_private_notes FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.client_private_notes TO service_role;
