-- Kids mode (K1–K10). Children never sign in: a parent's account owns the profiles.
-- The parent PIN stays on the device and is never sent here.

create table kid_shlokas (
  id          text primary key,             -- e.g. ks-4.7
  verse_id    text not null references verses (id),
  title       text not null,
  data        jsonb not null,               -- lines, simple meaning, pocket word, character
  updated_at  timestamptz not null default now()
);

create table kid_profiles (
  id          uuid primary key,
  parent_id   text not null references users (id) on delete cascade,
  name        text not null,
  age         int  not null check (age between 3 and 12),
  avatar      text not null default 'moru',
  created_at  timestamptz not null default now()
);
create index kid_profiles_parent on kid_profiles (parent_id);

create table kid_progress (
  kid_id      uuid not null references kid_profiles (id) on delete cascade,
  kind        text not null check (kind in ('story', 'shloka', 'game')),
  item_id     text not null,
  stars       int  not null default 0,
  times       int  not null default 1,
  first_at    timestamptz not null default now(),
  last_at     timestamptz not null default now(),
  primary key (kid_id, kind, item_id)
);

create table kid_settings (
  parent_id        text primary key references users (id) on delete cascade,
  daily_limit_min  int     not null default 15 check (daily_limit_min between 5 and 120),
  bedtime_on       boolean not null default true,
  bedtime_start    text    not null default '19:30',
  bedtime_end      text    not null default '07:00',
  chant_gate       boolean not null default true,
  narration        text    not null default 'hi+en',
  strictness       text    not null default 'gentle',
  updated_at       timestamptz not null default now()
);
