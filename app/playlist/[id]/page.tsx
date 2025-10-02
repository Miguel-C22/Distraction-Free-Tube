import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PlaylistView from '@/components/PlaylistView'
import PlaylistInfo from '@/components/PlaylistInfo'
import { Video } from '@/types/database.types'

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch playlist details
  const { data: playlist, error: playlistError } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .single()

  if (playlistError || !playlist) {
    redirect('/dashboard')
  }

  // Fetch playlist videos with video details
  const { data: playlistVideos } = await supabase
    .from('playlist_videos')
    .select(`
      id,
      position,
      video_id,
      videos (*)
    `)
    .eq('playlist_id', id)
    .order('position')

  type PlaylistVideoData = {
    id: string
    position: number
    video_id: string
    videos: Array<Record<string, unknown>> | Record<string, unknown>
  }

  const videos = (playlistVideos || []).map((pv: PlaylistVideoData) => {
    const videoData = Array.isArray(pv.videos) ? pv.videos[0] : pv.videos
    return {
      playlistVideoId: pv.id,
      position: pv.position,
      ...videoData,
    } as unknown as Video
  })

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Playlist Info - Left Side */}
          <div className="lg:col-span-1">
            <PlaylistInfo playlist={playlist} />
          </div>

          {/* Playlist Contents - Right Side */}
          <div className="lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Playlist Contents</h2>
            <PlaylistView videos={videos} playlistId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}
