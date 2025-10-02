'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

interface NavbarProps {
  user: User | null
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-2 sm:px-4">
      <div className="flex-1 min-w-0">
        <Link href="/dashboard" className="btn btn-ghost text-base sm:text-xl normal-case gap-2 px-2 sm:px-4 min-w-0">
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
        </Link>
      </div>
      <div className="flex-none gap-2">
        {user && (
          <>
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
                  <button onClick={handleSignOut}>Logout</button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
