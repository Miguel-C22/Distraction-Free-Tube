export interface Video {
  id: string
  user_id: string
  youtube_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  duration: number | null
  channel_name: string | null
  created_at: string
  updated_at: string
}

export interface Playlist {
  id: string
  user_id: string
  name: string
  description: string | null
  thumbnail_url: string | null
  video_count: number
  total_duration: number
  created_at: string
  updated_at: string
}

export interface PlaylistVideo {
  id: string
  playlist_id: string
  video_id: string
  position: number
  created_at: string
}

export interface PlaylistWithVideos extends Playlist {
  videos?: (PlaylistVideo & { video: Video })[]
}
