'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-300 to-base-200 flex items-center justify-center px-4 py-8 safe-area-inset">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl">
              <svg
                className="w-9 h-9 text-primary-content"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            </div>
            <div className="absolute -inset-3 bg-primary/20 rounded-2xl blur-xl -z-10"></div>
          </div>
        </Link>

        {/* Card */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
              <p className="text-base-content/60">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="alert alert-error shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
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

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email address</span>
                </label>
                <label className="input input-bordered flex items-center gap-3 focus-within:input-primary">
                  <svg
                    className="w-5 h-5 opacity-60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="email"
                    className="grow"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <label className="input input-bordered flex items-center gap-3 focus-within:input-primary">
                  <svg
                    className="w-5 h-5 opacity-60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type="password"
                    className="grow"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block min-h-[3rem] text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="divider text-xs opacity-60">OR</div>

            <div className="text-center">
              <p className="text-sm text-base-content/60">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="link link-primary font-medium">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="link link-hover text-sm opacity-60">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
