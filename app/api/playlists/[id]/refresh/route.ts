import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchPlaylistMetadata } from '@/lib/youtube'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch existing playlist
    const { data: existingPlaylist, error: playlistError } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (playlistError || !existingPlaylist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    if (!existingPlaylist.youtube_playlist_id) {
      return NextResponse.json(
        { error: 'This playlist cannot be refreshed (no YouTube playlist ID stored)' },
        { status: 400 }
      )
    }

    // Fetch fresh data from YouTube
    const { playlist: playlistMetadata, videos: videosMetadata } = await fetchPlaylistMetadata(
      existingPlaylist.youtube_playlist_id
    )

    // Calculate total duration
    const totalDuration = videosMetadata.reduce((acc: number, video: any) => acc + (video.duration || 0), 0)

    // Update playlist metadata
    await supabase
      .from('playlists')
      .update({
        name: playlistMetadata.name,
        description: playlistMetadata.description,
        thumbnail_url: playlistMetadata.thumbnail_url,
        video_count: videosMetadata.length,
        total_duration: totalDuration,
      })
      .eq('id', params.id)

    // Get existing playlist videos
    const { data: existingPlaylistVideos } = await supabase
      .from('playlist_videos')
      .select('video_id, videos(youtube_id)')
      .eq('playlist_id', params.id)

    const existingVideoMap = new Map(
      existingPlaylistVideos?.map((pv: any) => [pv.videos.youtube_id, pv.video_id]) || []
    )

    // Delete all existing playlist_videos relationships
    await supabase.from('playlist_videos').delete().eq('playlist_id', params.id)

    // Re-add videos in new order
    for (let i = 0; i < videosMetadata.length; i++) {
      const videoMetadata = videosMetadata[i]
      let videoId = existingVideoMap.get(videoMetadata.youtube_id)

      // If video doesn't exist, create it
      if (!videoId) {
        const { data: existingVideo } = await supabase
          .from('videos')
          .select('id')
          .eq('user_id', user.id)
          .eq('youtube_id', videoMetadata.youtube_id)
          .single()

        if (existingVideo) {
          videoId = existingVideo.id
        } else {
          const { data: newVideo } = await supabase
            .from('videos')
            .insert({
              user_id: user.id,
              ...videoMetadata,
            })
            .select('id')
            .single()

          videoId = newVideo?.id
        }
      }

      // Add to playlist
      if (videoId) {
        await supabase.from('playlist_videos').insert({
          playlist_id: params.id,
          video_id: videoId,
          position: i,
        })
      }
    }

    return NextResponse.json({
      message: 'Playlist refreshed successfully',
      videoCount: videosMetadata.length,
    })
  } catch (error) {
    console.error('Error refreshing playlist:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refresh playlist' },
      { status: 500 }
    )
  }
}
