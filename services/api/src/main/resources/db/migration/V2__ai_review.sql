-- W3 · AI answers review: who resolved a flag, how, and why.
alter table ai_answers add column review_action text;      -- dismissed | confirmed
alter table ai_answers add column review_note   text;
alter table ai_answers add column reviewed_by   text;
alter table ai_answers add column reviewed_at   timestamptz;
