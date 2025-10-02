// YouTube URL parsing utilities
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function extractPlaylistId(url: string): string | null {
  const patterns = [
    /[?&]list=([^&\n?#]+)/,
    /^(PL[a-zA-Z0-9_-]+)$/, // Direct playlist ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return 0

  const hours = parseInt(match[1]) || 0
  const minutes = parseInt(match[2]) || 0
  const seconds = parseInt(match[3]) || 0

  return hours * 3600 + minutes * 60 + seconds
}

// YouTube API functions
export async function fetchVideoMetadata(videoId: string) {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured')
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch video metadata')
  }

  const data = await response.json()
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found')
  }

  const video = data.items[0]
  return {
    youtube_id: videoId,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnail_url: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
    duration: parseDuration(video.contentDetails.duration),
    channel_name: video.snippet.channelTitle,
  }
}

export async function fetchPlaylistMetadata(playlistId: string) {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured')
  }

  // Fetch playlist details
  const playlistResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${process.env.YOUTUBE_API_KEY}`
  )

  if (!playlistResponse.ok) {
    throw new Error('Failed to fetch playlist metadata')
  }

  const playlistData = await playlistResponse.json()
  if (!playlistData.items || playlistData.items.length === 0) {
    throw new Error('Playlist not found')
  }

  const playlist = playlistData.items[0]

  // Fetch playlist items
  const itemsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${process.env.YOUTUBE_API_KEY}`
  )

  if (!itemsResponse.ok) {
    throw new Error('Failed to fetch playlist items')
  }

  const itemsData = await itemsResponse.json()
  const videoIds = itemsData.items.map((item: { snippet: { resourceId: { videoId: string } } }) => item.snippet.resourceId.videoId).join(',')

  // Fetch video details for all videos in playlist
  const videosResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`
  )

  if (!videosResponse.ok) {
    throw new Error('Failed to fetch video details')
  }

  const videosData = await videosResponse.json()

  return {
    playlist: {
      name: playlist.snippet.title,
      description: playlist.snippet.description,
      thumbnail_url: playlist.snippet.thumbnails.high?.url || playlist.snippet.thumbnails.default?.url,
      video_count: playlist.contentDetails.itemCount,
    },
    videos: videosData.items.map((video: { id: string; snippet: { title: string; description: string; thumbnails: { high?: { url: string }; default?: { url: string }; }; channelTitle: string }; contentDetails: { duration: string } }) => ({
      youtube_id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail_url: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
      duration: parseDuration(video.contentDetails.duration),
      channel_name: video.snippet.channelTitle,
    })),
  }
}
