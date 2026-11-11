CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL CHECK (char_length(trim(name_en)) BETWEEN 1 AND 120),
  name_fr text NOT NULL DEFAULT '',
  name_nl text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  description_fr text NOT NULL DEFAULT '',
  description_nl text NOT NULL DEFAULT '',
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  show_when_out_of_stock boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  image_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-photos', 'product-photos', true, 5242880, ARRAY['image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/webp'];
