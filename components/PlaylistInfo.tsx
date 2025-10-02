'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDuration } from '@/lib/youtube'
import { useRouter } from 'next/navigation'

interface PlaylistInfoProps {
  playlist: {
    id: string
    name: string
    description: string | null
    thumbnail_url: string | null
    video_count: number
    total_duration: number
    youtube_playlist_id: string | null
  }
}

export default function PlaylistInfo({ playlist }: PlaylistInfoProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRefresh = async () => {
    setRefreshing(true)
    setError(null)

    try {
      const response = await fetch(`/api/playlists/${playlist.id}/refresh`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh playlist')
      }

      // Reload the page to show updated data
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh playlist')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl lg:sticky lg:top-8">
      <figure className="relative aspect-video bg-base-300">
        {playlist.thumbnail_url ? (
          <Image
            src={playlist.thumbnail_url}
            alt={playlist.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 opacity-20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
        )}
      </figure>
      <div className="card-body p-4 sm:p-6">
        <h1 className="card-title text-xl sm:text-2xl">{playlist.name}</h1>
        {playlist.description && (
          <p className="text-xs sm:text-sm opacity-70 mb-3 sm:mb-4">{playlist.description}</p>
        )}
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 opacity-60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
          </svg>
          <span className="text-xs sm:text-sm opacity-70">Playlist</span>
        </div>
        <div className="stats stats-vertical shadow bg-base-200">
          <div className="stat py-2 sm:py-3">
            <div className="stat-title text-xs">Videos</div>
            <div className="stat-value text-xl sm:text-2xl">{playlist.video_count}</div>
          </div>
          <div className="stat py-2 sm:py-3">
            <div className="stat-title text-xs">Total Duration</div>
            <div className="stat-value text-xl sm:text-2xl">
              {formatDuration(playlist.total_duration)}
            </div>
          </div>
        </div>

        {playlist.youtube_playlist_id && (
          <div className="mt-3 sm:mt-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-outline btn-xs sm:btn-sm w-full gap-2"
            >
              {refreshing ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  <span className="text-xs sm:text-sm">Refreshing...</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm">Refresh from YouTube</span>
                </>
              )}
            </button>
            {error && (
              <div className="alert alert-error mt-2 text-xs py-2">
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
