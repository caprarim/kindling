-- Kindling API — Cloudflare D1 schema.
--
-- Three tables. Identity is a single opaque token that the server mints and
-- only ever stores hashed, so a dump of this database cannot be used to sign in
-- as anyone.

create table if not exists accounts (
  id           text    primary key,
  -- SHA-256 of the recovery code. The code itself is never stored.
  token_hash   text    not null unique,
  created_at   integer not null,
  last_seen_at integer not null
);

create table if not exists saved_ideas (
  account_id text    not null references accounts (id) on delete cascade,
  idea_id    text    not null,
  payload    text    not null,
  created_at integer not null,
  primary key (account_id, idea_id)
);

-- Only the fingerprint is kept. That is all the generator needs to guarantee an
-- idea is never produced for this person a second time, on any device.
create table if not exists seen_ideas (
  account_id text    not null references accounts (id) on delete cascade,
  idea_id    text    not null,
  created_at integer not null,
  primary key (account_id, idea_id)
);

create index if not exists saved_ideas_account_idx on saved_ideas (account_id, created_at desc);
create index if not exists seen_ideas_account_idx  on seen_ideas  (account_id);
