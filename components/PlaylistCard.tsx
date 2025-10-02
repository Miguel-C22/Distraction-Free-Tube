'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Playlist } from '@/types/database.types'
import { formatDuration } from '@/lib/youtube'
import { useRouter } from 'next/navigation'

interface PlaylistCardProps {
  playlist: Playlist
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Delete "${playlist.name}"? This will remove the playlist and all its videos from your library.`)) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/playlists/${playlist.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete playlist')
      }

      router.refresh()
    } catch (error) {
      console.error('Error deleting playlist:', error)
      alert('Failed to delete playlist')
      setDeleting(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow group relative">
      <Link href={`/playlist/${playlist.id}`}>
        <figure className="relative aspect-video bg-base-300">
          {playlist.thumbnail_url ? (
            <Image
              src={playlist.thumbnail_url}
              alt={playlist.name}
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
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
            </svg>
            {playlist.video_count} videos
          </div>
          {playlist.total_duration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
              {formatDuration(playlist.total_duration)}
            </div>
          )}
        </figure>
        <div className="card-body p-4">
          <h3 className="card-title text-base line-clamp-2 group-hover:text-primary transition-colors">
            {playlist.name}
          </h3>
          {playlist.description && (
            <p className="text-sm opacity-60 line-clamp-2">{playlist.description}</p>
          )}
        </div>
      </Link>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="btn btn-circle btn-sm btn-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Delete playlist"
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
