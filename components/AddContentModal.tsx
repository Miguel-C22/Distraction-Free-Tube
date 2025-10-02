'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { extractVideoId, extractPlaylistId } from '@/lib/youtube'

interface AddContentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddContentModal({ isOpen, onClose }: AddContentModalProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'playlist'>('video')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (activeTab === 'video') {
        const videoId = extractVideoId(url)
        if (!videoId) {
          setError('Invalid YouTube video URL')
          setLoading(false)
          return
        }

        const response = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to add video')
        }
      } else {
        const playlistId = extractPlaylistId(url)
        if (!playlistId) {
          setError('Invalid YouTube playlist URL')
          setLoading(false)
          return
        }

        const response = await fetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlistId }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to add playlist')
        }
      }

      setUrl('')
      onClose()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setUrl('')
    setError(null)
    setActiveTab('video')
    onClose()
  }

  if (!isOpen) return null

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl w-full mx-4">
        <form method="dialog">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={handleClose}
          >
            ✕
          </button>
        </form>

        <h3 className="font-bold text-xl sm:text-2xl mb-4 sm:mb-6 pr-8">Add to Your Library</h3>

        <div role="tablist" className="tabs tabs-boxed mb-4 sm:mb-6 bg-base-200 p-1">
          <a
            role="tab"
            className={`tab flex-1 text-xs sm:text-sm ${activeTab === 'video' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            Single Video
          </a>
          <a
            role="tab"
            className={`tab flex-1 text-xs sm:text-sm ${activeTab === 'playlist' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('playlist')}
          >
            Playlist
          </a>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-sm sm:text-base font-medium">
                YouTube {activeTab === 'video' ? 'Video' : 'Playlist'} URL
              </span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 opacity-60 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <input
                type="text"
                className="grow text-sm sm:text-base"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </label>
            <label className="label">
              <span className="label-text-alt text-xs opacity-60">
                Paste any YouTube {activeTab === 'video' ? 'video' : 'playlist'} URL to add it to your library
              </span>
            </label>
          </div>

          {error && (
            <div className="alert alert-error mb-4 py-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary btn-block text-sm sm:text-base ${loading ? 'loading' : ''}`}
            disabled={loading || !url}
          >
            {loading ? 'Adding...' : `Add ${activeTab === 'video' ? 'Video' : 'Playlist'}`}
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={handleClose}>close</button>
      </form>
    </dialog>
  )
}
