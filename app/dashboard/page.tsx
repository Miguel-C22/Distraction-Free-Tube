'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import VideoCard from '@/components/VideoCard'
import PlaylistCard from '@/components/PlaylistCard'
import AddContentModal from '@/components/AddContentModal'
import { Video, Playlist } from '@/types/database.types'
import { User } from '@supabase/supabase-js'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      await loadContent()
    }

    loadUser()
  }, [])

  async function loadContent() {
    setLoading(true)
    try {
      // Fetch playlists
      const { data: playlistsData } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch all videos
      const { data: allVideos } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch all playlist_videos relationships
      const { data: playlistVideoRelations } = await supabase
        .from('playlist_videos')
        .select('video_id')

      // Filter out videos that are in any playlist
      const videoIdsInPlaylists = new Set(
        playlistVideoRelations?.map(pv => pv.video_id) || []
      )

      const standaloneVideos = allVideos?.filter(
        video => !videoIdsInPlaylists.has(video.id)
      ) || []

      setVideos(standaloneVideos)
      setPlaylists(playlistsData || [])
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    loadContent() // Reload content after adding
  }

  if (!user) {
    return null
  }

  const totalVideos = videos.length
  const totalPlaylists = playlists.length
  const allItems = [...playlists, ...videos]

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 border-b border-base-300 px-2 sm:px-4">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="btn btn-ghost text-base sm:text-xl normal-case gap-2 px-2 sm:px-4 min-w-0"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="hidden sm:inline truncate">Distraction-Free Tube</span>
            <span className="sm:hidden truncate">DF Tube</span>
          </button>
        </div>
        <div className="flex-none gap-2">
          <button className="btn btn-primary gap-2 btn-sm sm:btn-md" onClick={handleOpenModal}>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">Add Video</span>
          </button>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar placeholder btn-sm sm:btn-md"
            >
              <div className="bg-neutral text-neutral-content rounded-full w-8 sm:w-10">
                <span className="text-base sm:text-lg">{user.email?.[0].toUpperCase()}</span>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border border-base-300"
            >
              <li className="menu-title px-4 py-2">
                <span className="text-xs opacity-60 truncate">{user.email}</span>
              </li>
              <li>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    router.push('/login')
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Your Library</h1>
            <p className="text-xs sm:text-sm opacity-60 mt-1">
              {totalPlaylists} playlist{totalPlaylists !== 1 ? 's' : ''}
              {totalVideos > 0 && ` · ${totalVideos} standalone video${totalVideos !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : allItems.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center py-20">
              <svg
                className="w-20 h-20 opacity-20 mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Your library is empty</h2>
              <p className="text-lg opacity-60 mb-6">
                Add some YouTube videos or playlists to get started
              </p>
              <button className="btn btn-primary gap-2" onClick={handleOpenModal}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Your First Video
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>

      <AddContentModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}
