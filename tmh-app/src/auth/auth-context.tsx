import { createContext, useContext, useState, type ReactNode } from 'react'
import { readJSON, writeJSON, removeKey } from '../lib/storage/storage'

export interface AuthUser { email: string; name: string }
interface AuthContextValue {
  user: AuthUser | null
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AdminUser = { email: 'admin@tmh.com', password: 'admin', name: 'Admin User' }
const SESSION_KEY = 'session'

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readJSON<AuthUser>(SESSION_KEY))
  const login = (email: string, password: string): boolean => {
    if (email.trim().toLowerCase() === AdminUser.email && password === AdminUser.password) {
      const u: AuthUser = { email: AdminUser.email, name: AdminUser.name }
      writeJSON(SESSION_KEY, u)
      setUser(u)
      return true
    }
    return false
  }
  const logout = () => {
    removeKey(SESSION_KEY)
    setUser(null)
  }
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
