import { useAuth } from '../auth/auth-context'

export default function UserInfo() {
  const { user, logout } = useAuth()
  if (!user) return null
  return (
    <div className="border-t border-white/20 p-3">
      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
      <p className="text-xs text-white/70 truncate">{user.email}</p>
      <button onClick={logout} className="mt-2 w-full text-white bg-white/10 hover:bg-white/20 rounded px-3 py-1.5 text-sm">
        Logout
      </button>
    </div>
  )
}
