-- Add youtube_playlist_id to playlists table
-- Run this in your Supabase SQL Editor to enable playlist refresh feature

ALTER TABLE playlists
ADD COLUMN youtube_playlist_id text;

-- Add index for faster lookups
CREATE INDEX playlists_youtube_playlist_id_idx ON playlists(youtube_playlist_id);
