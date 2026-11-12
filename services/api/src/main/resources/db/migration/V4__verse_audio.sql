-- Recitation audio for verses (FR-VS-02). Set from the CMS verse field audio_url; null until a recording is published.
alter table verses add column audio_url text;
