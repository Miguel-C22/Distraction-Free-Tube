import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import VideoPlayer from '@/components/VideoPlayer'

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ playlist?: string; index?: string }>
}) {
  const { id } = await params
  const { playlist, index } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch video details
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single()

  if (videoError || !video) {
    redirect('/dashboard')
  }

  // Fetch playlist videos if playing from a playlist
  let playlistVideos: Array<{ id: string; youtube_id: string }> = []
  if (playlist) {
    const { data: playlistVideoData } = await supabase
      .from('playlist_videos')
      .select(`
        video_id,
        videos (id, youtube_id)
      `)
      .eq('playlist_id', playlist)
      .order('position')

    type PlaylistVideoData = {
      video_id: string
      videos: Array<{ id: string; youtube_id: string }> | { id: string; youtube_id: string }
    }

    playlistVideos = playlistVideoData?.map((pv: PlaylistVideoData) => {
      return Array.isArray(pv.videos) ? pv.videos[0] : pv.videos
    }) || []
  }

  const currentIndex = index ? parseInt(index) : 0

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Video Player - Main Content */}
          <div className="lg:col-span-2">
            <VideoPlayer
              videoId={video.id}
              youtubeId={video.youtube_id}
              playlistId={playlist}
              playlistVideos={playlistVideos}
              currentIndex={currentIndex}
            />

            <div className="mt-4 sm:mt-6 bg-base-100 rounded-lg shadow-lg p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{video.title}</h1>
              {video.channel_name && (
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-8 sm:w-10">
                      <span className="text-base sm:text-lg">{video.channel_name[0].toUpperCase()}</span>
                    </div>
                  </div>
                  <span className="text-sm sm:text-base font-medium">{video.channel_name}</span>
                </div>
              )}
              {video.description && (
                <div className="mt-3 sm:mt-4">
                  <div className="collapse collapse-arrow bg-base-200">
                    <input type="checkbox" />
                    <div className="collapse-title text-sm sm:text-base font-medium">Description</div>
                    <div className="collapse-content">
                      <p className="text-sm sm:text-base whitespace-pre-wrap">{video.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Empty for now (could add related videos from user's library) */}
          <div className="lg:col-span-1">
            <div className="bg-base-100 rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Your Library</h2>
              <p className="text-xs sm:text-sm opacity-60">
                No distractions here. Focus on what you chose to watch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
