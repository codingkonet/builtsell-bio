-- ============================================================
-- BuiltSELL — Supabase schema & security policies
-- Run this once in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1) Table holding a single JSON blob of all site content
create table if not exists public.site_content (
  id          int primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- 2) Seed the single row (id = 1)
insert into public.site_content (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

-- 3) Enable Row Level Security
alter table public.site_content enable row level security;

-- 4) Anyone (anon) can READ the content -> the public landing page works
drop policy if exists "public read content" on public.site_content;
create policy "public read content"
  on public.site_content
  for select
  using (true);

-- 5) Only signed-in admins can WRITE (insert/update) the content
drop policy if exists "auth update content" on public.site_content;
create policy "auth update content"
  on public.site_content
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "auth insert content" on public.site_content;
create policy "auth insert content"
  on public.site_content
  for insert
  to authenticated
  with check (true);

-- 6) Auto-update the updated_at timestamp on save
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_touch_site_content on public.site_content;
create trigger trg_touch_site_content
  before update on public.site_content
  for each row execute function public.touch_updated_at();
