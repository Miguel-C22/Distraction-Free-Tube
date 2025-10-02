'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Video } from '@/types/database.types'
import { formatDuration } from '@/lib/youtube'
import { useRouter } from 'next/navigation'

interface VideoCardProps {
  video: Video
}

export default function VideoCard({ video }: VideoCardProps) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Delete "${video.title}"? This will remove the video from your library.`)) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete video')
      }

      router.refresh()
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('Failed to delete video')
      setDeleting(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow group relative">
      <Link href={`/watch/${video.id}`}>
        <div className="cursor-pointer">
        <figure className="relative aspect-video bg-base-300">
          {video.thumbnail_url ? (
            <Image
              src={video.thumbnail_url}
              alt={video.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-16 h-16 opacity-20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            </div>
          )}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </figure>
        <div className="card-body p-4">
          <h3 className="card-title text-base line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          {video.channel_name && (
            <p className="text-sm opacity-60">{video.channel_name}</p>
          )}
        </div>
        </div>
      </Link>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="btn btn-circle btn-sm btn-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Delete video"
      >
        {deleting ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
