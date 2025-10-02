import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-300 to-base-200 flex items-center justify-center px-4 py-8 safe-area-inset">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                <svg
                  className="w-14 h-14 text-primary-content"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
              <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-xl -z-10"></div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Distraction-Free Tube
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-base-content/70 max-w-2xl mx-auto leading-relaxed">
            Watch YouTube videos and playlists your way. No recommendations, no comments, no autoplay.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href="/login"
              className="btn btn-primary btn-lg text-lg px-8 min-h-[3.5rem] w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
            >
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Login
            </Link>
            <Link
              href="/signup"
              className="btn btn-outline btn-lg text-lg px-8 min-h-[3.5rem] w-full sm:w-auto"
            >
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Sign Up
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
          <div className="card bg-base-100/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="card-title text-lg">Distraction-Free</h3>
              <p className="text-sm opacity-70">No algorithmic recommendations or endless scrolling</p>
            </div>
          </div>

          <div className="card bg-base-100/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body items-center text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="card-title text-lg">Manual Curation</h3>
              <p className="text-sm opacity-70">You choose what to watch, nothing else</p>
            </div>
          </div>

          <div className="card bg-base-100/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body items-center text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="card-title text-lg">Clean Interface</h3>
              <p className="text-sm opacity-70">Minimal design focused on content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
