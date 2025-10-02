'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface VideoPlayerProps {
  videoId: string
  youtubeId: string
  playlistId?: string
  playlistVideos?: Array<{ id: string; youtube_id: string }>
  currentIndex?: number
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function VideoPlayer({
  videoId,
  youtubeId,
  playlistId,
  playlistVideos = [],
  currentIndex = 0,
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [isPlayerReady, setIsPlayerReady] = useState(false)

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      if (containerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: youtubeId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: () => setIsPlayerReady(true),
            onStateChange: onPlayerStateChange,
          },
        })
      }
    }

    // If YT is already loaded, initialize immediately
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady()
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [youtubeId])

  const onPlayerStateChange = (event: any) => {
    // When video ends (state 0), play next video if in playlist
    if (event.data === 0 && playlistId && playlistVideos.length > 0) {
      const nextIndex = currentIndex + 1
      if (nextIndex < playlistVideos.length) {
        const nextVideo = playlistVideos[nextIndex]
        router.push(`/watch/${nextVideo.id}?playlist=${playlistId}&index=${nextIndex}`)
      } else {
        // Playlist finished, optionally loop back to start
        console.log('Playlist finished')
      }
    }
  }

  const playNext = () => {
    if (playlistId && playlistVideos.length > 0) {
      const nextIndex = currentIndex + 1
      if (nextIndex < playlistVideos.length) {
        const nextVideo = playlistVideos[nextIndex]
        router.push(`/watch/${nextVideo.id}?playlist=${playlistId}&index=${nextIndex}`)
      }
    }
  }

  const playPrevious = () => {
    if (playlistId && playlistVideos.length > 0) {
      const prevIndex = currentIndex - 1
      if (prevIndex >= 0) {
        const prevVideo = playlistVideos[prevIndex]
        router.push(`/watch/${prevVideo.id}?playlist=${playlistId}&index=${prevIndex}`)
      }
    }
  }

  return (
    <div>
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl aspect-video relative">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {playlistId && playlistVideos.length > 0 && (
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 bg-base-100 rounded-lg p-3 sm:p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-60 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">
              Playing from playlist ({currentIndex + 1} / {playlistVideos.length})
            </span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={playPrevious}
              disabled={currentIndex === 0}
              className="btn btn-xs sm:btn-sm btn-ghost flex-1 sm:flex-none"
              title="Previous video"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button
              onClick={playNext}
              disabled={currentIndex >= playlistVideos.length - 1}
              className="btn btn-xs sm:btn-sm btn-ghost flex-1 sm:flex-none"
              title="Next video"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
