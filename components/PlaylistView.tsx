'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDuration } from '@/lib/youtube'

interface Video {
  id: string
  title: string
  thumbnail_url: string | null
  duration: number | null
  channel_name: string | null
  youtube_id: string
}

interface PlaylistViewProps {
  videos: Video[]
  playlistId: string
}

export default function PlaylistView({ videos, playlistId }: PlaylistViewProps) {
  const [shuffled, setShuffled] = useState(false)
  const [displayVideos, setDisplayVideos] = useState(videos)

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const handleShuffle = () => {
    if (shuffled) {
      // Reset to original order
      setDisplayVideos(videos)
      setShuffled(false)
    } else {
      // Shuffle
      setDisplayVideos(shuffleArray(videos))
      setShuffled(true)
    }
  }

  const handlePlayAll = () => {
    // Play the first video in current order
    if (displayVideos.length > 0) {
      window.location.href = `/watch/${displayVideos[0].id}?playlist=${playlistId}&index=0`
    }
  }

  if (videos.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center py-12">
          <svg
            className="w-16 h-16 opacity-20 mb-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
          </svg>
          <p className="text-lg opacity-60">This playlist is empty</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
        <button
          onClick={handlePlayAll}
          className="btn btn-primary gap-2 btn-sm sm:btn-md flex-1 sm:flex-none"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Play All
        </button>
        <button
          onClick={handleShuffle}
          className={`btn ${shuffled ? 'btn-secondary' : 'btn-outline'} gap-2 btn-sm sm:btn-md flex-1 sm:flex-none`}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {shuffled ? 'Shuffled' : 'Shuffle'}
        </button>
      </div>

      {/* Video List */}
      <div className="space-y-2 sm:space-y-3">
        {displayVideos.map((video, index) => (
          <Link
            key={`${video.id}-${index}`}
            href={`/watch/${video.id}?playlist=${playlistId}&index=${index}`}
            className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
          >
            <div className="card-body p-3 sm:p-4">
              <div className="flex gap-2 sm:gap-4">
                <div className="flex-shrink-0 w-6 sm:w-8 text-center">
                  <span className="text-base sm:text-lg font-semibold opacity-60">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-shrink-0 relative w-28 sm:w-40 aspect-video bg-base-300 rounded overflow-hidden">
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 112px, 160px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 opacity-20"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      </svg>
                    </div>
                  )}
                  {video.duration && (
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold line-clamp-2 mb-1">
                    {video.title}
                  </h3>
                  {video.channel_name && (
                    <p className="text-xs sm:text-sm opacity-60">{video.channel_name}</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
