alter table public.services
  add column if not exists name_en text,
  add column if not exists description_en text;

update public.services
set
  name_en = coalesce(name_en, name),
  description_en = coalesce(description_en, description);
