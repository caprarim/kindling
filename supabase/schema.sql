-- Kindling — backend schema.
--
-- Kindling works with no backend at all: ideas, the saved library and the
-- "never show this twice" record all live in the browser. Supabase adds exactly
-- one thing — the same library on every device — so this schema is small on
-- purpose.
--
-- Apply with:
--   supabase db push
-- or paste into the SQL editor of a fresh project.

-- ── Saved ideas ─────────────────────────────────────────────────────────────
create table if not exists public.saved_ideas (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  idea_id    text        not null,
  payload    jsonb       not null,
  created_at timestamptz not null default now(),
  primary key (user_id, idea_id)
);

-- ── Ideas already shown ─────────────────────────────────────────────────────
-- Only the fingerprint is stored. That is all the generator needs to guarantee
-- an idea is never produced for this person a second time.
create table if not exists public.seen_ideas (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  idea_id    text        not null,
  created_at timestamptz not null default now(),
  primary key (user_id, idea_id)
);

create index if not exists saved_ideas_user_idx on public.saved_ideas (user_id, created_at desc);
create index if not exists seen_ideas_user_idx  on public.seen_ideas  (user_id);

-- ── Row level security ──────────────────────────────────────────────────────
-- Every row is owned by exactly one person and reachable by nobody else.
alter table public.saved_ideas enable row level security;
alter table public.seen_ideas  enable row level security;

drop policy if exists "own saved ideas" on public.saved_ideas;
create policy "own saved ideas" on public.saved_ideas
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own seen ideas" on public.seen_ideas;
create policy "own seen ideas" on public.seen_ideas
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
