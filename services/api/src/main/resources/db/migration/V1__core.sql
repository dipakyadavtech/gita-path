-- identity
create table users (
  id          text primary key,
  name        text not null,
  phone       text,
  created_at  timestamptz not null default now()
);

-- content (read-only copy of published CMS content)
create table chapters (
  number       int primary key,
  name         text not null,
  english      text not null,
  verse_count  int not null
);
create table verses (
  id          text primary key,
  chapter     int not null,
  number      int not null,
  sanskrit    jsonb not null,
  iast        text not null,
  meaning     text not null,
  life_note   text not null,
  words       jsonb not null,
  themes      jsonb not null,
  actions     jsonb not null,
  checksum    text not null,
  updated_at  timestamptz not null default now()
);
create index verses_chapter_idx on verses (chapter, number);
create table stories (
  id         text primary key,
  season     int not null,
  episode    int not null,
  title      text not null,
  minutes    int not null,
  verse_id   text,
  kids_safe  boolean not null default false,
  kids       boolean not null default false,
  summary    text,
  scenes     jsonb
);
create table topics (
  id      text primary key,
  title   text not null,
  verses  jsonb not null,
  moods   jsonb not null
);

-- learning
create table verse_steps (
  user_id          text not null references users (id) on delete cascade,
  verse_id         text not null,
  listened         boolean not null default false,
  understood       boolean not null default false,
  action_done      boolean not null default false,
  chant_count      int not null default 0,
  action_check_in  text,
  completed_at     timestamptz,
  primary key (user_id, verse_id)
);
create table streaks (
  user_id    text primary key references users (id) on delete cascade,
  current    int not null default 0,
  longest    int not null default 0,
  last_date  date,
  freezes    int not null default 1
);

-- circle
create table circles (
  id                 uuid primary key,
  name               text not null,
  code               text not null unique,
  owner_id           text not null references users (id) on delete cascade,
  challenge_title    text not null,
  challenge_chapter  int not null,
  code_expires_at    timestamptz not null,
  created_at         timestamptz not null default now()
);
create table circle_members (
  circle_id  uuid not null references circles (id) on delete cascade,
  user_id    text not null references users (id) on delete cascade,
  status     text not null check (status in ('member', 'pending')),
  joined_at  timestamptz not null default now(),
  primary key (circle_id, user_id)
);
create table circle_feed (
  id         bigserial primary key,
  circle_id  uuid not null references circles (id) on delete cascade,
  who        text not null,
  what       text not null,
  at         timestamptz not null default now()
);

-- billing
create table entitlements (
  user_id     text primary key references users (id) on delete cascade,
  plan        text not null default 'free',
  source      text,
  updated_at  timestamptz not null default now()
);

-- guide (answers kept for review; FR-AD-03)
create table ai_answers (
  id            uuid primary key,
  user_id       text not null references users (id) on delete cascade,
  asked_on      date not null default current_date,
  question      text not null,
  answer        text,
  cited         jsonb not null default '[]',
  safety_label  text not null,
  flagged       boolean not null default false,
  flag_reason   text,
  reviewed      boolean not null default false,
  created_at    timestamptz not null default now()
);
create index ai_answers_user_day_idx on ai_answers (user_id, asked_on);
create index ai_answers_flagged_idx on ai_answers (flagged) where flagged;
