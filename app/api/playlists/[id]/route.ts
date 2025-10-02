import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
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

    // Get all video IDs in this playlist
    const { data: playlistVideos } = await supabase
      .from('playlist_videos')
      .select('video_id')
      .eq('playlist_id', params.id)

    const videoIds = playlistVideos?.map(pv => pv.video_id) || []

    // Delete playlist (cascade will handle playlist_videos)
    const { error: playlistError } = await supabase
      .from('playlists')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (playlistError) {
      console.error('Delete playlist error:', playlistError)
      return NextResponse.json(
        { error: 'Failed to delete playlist' },
        { status: 500 }
      )
    }

    // Delete all videos that were in this playlist
    if (videoIds.length > 0) {
      const { error: videosError } = await supabase
        .from('videos')
        .delete()
        .in('id', videoIds)
        .eq('user_id', user.id)

      if (videosError) {
        console.error('Delete videos error:', videosError)
      }
    }

    return NextResponse.json({ message: 'Playlist and videos deleted successfully' })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    )
  }
}
