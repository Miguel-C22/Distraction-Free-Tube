-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Videos table
create table videos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  youtube_id text not null,
  title text not null,
  description text,
  thumbnail_url text,
  duration integer, -- in seconds
  channel_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Playlists table
create table playlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  thumbnail_url text,
  video_count integer default 0,
  total_duration integer default 0, -- in seconds
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Playlist videos junction table
create table playlist_videos (
  id uuid primary key default uuid_generate_v4(),
  playlist_id uuid references playlists(id) on delete cascade not null,
  video_id uuid references videos(id) on delete cascade not null,
  position integer not null,
  created_at timestamp with time zone default now(),
  unique(playlist_id, video_id),
  unique(playlist_id, position)
);

-- Row Level Security (RLS) Policies
alter table videos enable row level security;
alter table playlists enable row level security;
alter table playlist_videos enable row level security;

-- Videos policies
create policy "Users can view their own videos"
  on videos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own videos"
  on videos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own videos"
  on videos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own videos"
  on videos for delete
  using (auth.uid() = user_id);

-- Playlists policies
create policy "Users can view their own playlists"
  on playlists for select
  using (auth.uid() = user_id);

create policy "Users can insert their own playlists"
  on playlists for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own playlists"
  on playlists for update
  using (auth.uid() = user_id);

create policy "Users can delete their own playlists"
  on playlists for delete
  using (auth.uid() = user_id);

-- Playlist videos policies
create policy "Users can view their own playlist videos"
  on playlist_videos for select
  using (
    exists (
      select 1 from playlists
      where playlists.id = playlist_videos.playlist_id
      and playlists.user_id = auth.uid()
    )
  );

create policy "Users can insert their own playlist videos"
  on playlist_videos for insert
  with check (
    exists (
      select 1 from playlists
      where playlists.id = playlist_videos.playlist_id
      and playlists.user_id = auth.uid()
    )
  );

create policy "Users can update their own playlist videos"
  on playlist_videos for update
  using (
    exists (
      select 1 from playlists
      where playlists.id = playlist_videos.playlist_id
      and playlists.user_id = auth.uid()
    )
  );

create policy "Users can delete their own playlist videos"
  on playlist_videos for delete
  using (
    exists (
      select 1 from playlists
      where playlists.id = playlist_videos.playlist_id
      and playlists.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index videos_user_id_idx on videos(user_id);
create index videos_youtube_id_idx on videos(youtube_id);
create index playlists_user_id_idx on playlists(user_id);
create index playlist_videos_playlist_id_idx on playlist_videos(playlist_id);
create index playlist_videos_video_id_idx on playlist_videos(video_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_videos_updated_at before update on videos
  for each row execute procedure update_updated_at_column();

create trigger update_playlists_updated_at before update on playlists
  for each row execute procedure update_updated_at_column();
