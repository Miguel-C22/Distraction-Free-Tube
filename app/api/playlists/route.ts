import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchPlaylistMetadata } from '@/lib/youtube'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { playlistId } = await request.json()

    if (!playlistId) {
      return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 })
    }

    // Fetch playlist metadata from YouTube
    const { playlist: playlistMetadata, videos: videosMetadata } = await fetchPlaylistMetadata(playlistId)

    // Calculate total duration
    const totalDuration = videosMetadata.reduce((acc: number, video: { duration?: number }) => acc + (video.duration || 0), 0)

    // Insert playlist into database
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .insert({
        user_id: user.id,
        youtube_playlist_id: playlistId,
        name: playlistMetadata.name,
        description: playlistMetadata.description,
        thumbnail_url: playlistMetadata.thumbnail_url,
        video_count: videosMetadata.length,
        total_duration: totalDuration,
      })
      .select()
      .single()

    if (playlistError) {
      console.error('Playlist insert error:', playlistError)
      return NextResponse.json(
        { error: 'Failed to save playlist' },
        { status: 500 }
      )
    }

    // Insert videos and create playlist_videos relationships
    for (let i = 0; i < videosMetadata.length; i++) {
      const videoMetadata = videosMetadata[i]

      // Check if video already exists for this user
      let { data: existingVideo } = await supabase
        .from('videos')
        .select('id')
        .eq('user_id', user.id)
        .eq('youtube_id', videoMetadata.youtube_id)
        .single()

      // If video doesn't exist, create it
      if (!existingVideo) {
        const { data: newVideo, error: videoError } = await supabase
          .from('videos')
          .insert({
            user_id: user.id,
            ...videoMetadata,
          })
          .select()
          .single()

        if (videoError) {
          console.error('Video insert error:', videoError)
          continue
        }

        existingVideo = newVideo
      }

      // Create playlist_video relationship
      if (existingVideo) {
        await supabase.from('playlist_videos').insert({
          playlist_id: playlist.id,
          video_id: existingVideo.id,
          position: i,
        })
      }
    }

    return NextResponse.json({ playlist }, { status: 201 })
  } catch (error) {
    console.error('Error adding playlist:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add playlist' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: playlists, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 })
    }

    return NextResponse.json({ playlists })
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    )
  }
}
