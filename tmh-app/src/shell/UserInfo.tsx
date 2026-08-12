import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { LogOut, Settings, UserRound } from 'lucide-react'

interface UserInfoProps {
  collapsed: boolean
}

export default function UserInfo({ collapsed }: UserInfoProps) {
  const { user, logout } = useAuth()
  if (!user) return null

  if (collapsed) {
    return (
      <div className="border-t border-white/20 p-3">
        <div className="flex flex-col items-center gap-2">
          <div className="group relative -mx-3 w-[calc(100%+1.5rem)]">
            <button
              type="button"
              aria-label="View user information"
              title="View user information"
              className="mx-auto flex h-9 w-9 items-center justify-center rounded text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--brand-hex)]"
            >
              <UserRound className="h-5 w-5" />
            </button>
            <div className="absolute bottom-0 left-full z-20 hidden w-48 rounded border border-slate-200 bg-white p-3 text-slate-900 shadow-lg group-hover:block group-focus-within:block">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <NavLink
            to="/settings"
            aria-label="Settings"
            title="Settings"
            className="flex h-9 w-9 items-center justify-center rounded text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--brand-hex)]"
          >
            <Settings className="h-5 w-5" />
          </NavLink>
          <button
            type="button"
            onClick={logout}
            aria-label="Logout"
            title="Logout"
            className="flex h-9 w-9 items-center justify-center rounded text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--brand-hex)]"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-white/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs text-white/70">{user.email}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={logout}
            aria-label="Logout"
            title="Logout"
            className="flex h-9 w-9 items-center justify-center rounded text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--brand-hex)]"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <NavLink
            to="/settings"
            aria-label="Settings"
            title="Settings"
            className="flex h-9 w-9 items-center justify-center rounded text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--brand-hex)]"
          >
            <Settings className="h-5 w-5" />
          </NavLink>
        </div>
      </div>
    </div>
  )
}
