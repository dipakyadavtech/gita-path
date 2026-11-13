-- Recitation video for verses (story player E5, verse detail D2). Set from the CMS verse field video_url; null until a video is published.
alter table verses add column video_url text;
