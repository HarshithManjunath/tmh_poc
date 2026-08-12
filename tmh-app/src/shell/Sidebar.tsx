import { NavLink } from 'react-router-dom'
import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { Form, NotepadText, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import UserInfo from './UserInfo'

const SIDEBAR_COLLAPSED_KEY = 'tmh.sidebar.collapsed'

const links: { to: string; label: string; icon: ReactNode }[] = [
  { to: '/builder', label: 'Form Builder', icon: <Form className="h-4 w-4" /> },
  { to: '/worklist', label: 'Worklist', icon: <NotepadText className="h-4 w-4" /> },
]

function readCollapsedState() {
  if (typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(readCollapsedState)

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
    } catch {
      // Storage may be unavailable; the sidebar remains usable without persistence.
    }
  }, [collapsed])

  const CollapsibleUserInfo = UserInfo as unknown as ComponentType<{ collapsed: boolean }>

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-60'} relative flex shrink-0 flex-col justify-between transition-[width] duration-200`}
      style={{ backgroundColor: 'var(--brand-hex)' }}
    >
      <button
        type="button"
        onClick={() => setCollapsed(value => !value)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>
      <nav className="space-y-1 p-3">
        <p className={`${collapsed ? 'hidden' : ''} px-2 py-1 font-semibold text-white/80`}>TMH Reporting</p>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            aria-label={l.label}
            title={l.label}
            className={({ isActive }) =>
              `flex items-center rounded px-3 py-2 text-sm font-medium ${collapsed ? 'justify-center' : 'gap-2'} ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`
            }
          >
            {l.icon}
            <span className={collapsed ? 'hidden' : ''}>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <CollapsibleUserInfo collapsed={collapsed} />
    </aside>
  )
}
