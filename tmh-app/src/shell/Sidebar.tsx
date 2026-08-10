import { NavLink } from 'react-router-dom'
import Icon from '../components/Icon'
import UserInfo from './UserInfo'

const links = [
  { to: '/builder', label: 'Form Builder', icon: 'printer' },
  { to: '/worklist', label: 'Worklist', icon: 'download' },
] as const

export default function Sidebar() {
  return (
    <aside className="w-60 flex flex-col justify-between" style={{ backgroundColor: 'var(--brand-hex)' }}>
      <nav className="p-3 space-y-1">
        <p className="px-2 py-1 text-white/80 font-semibold">TMH Reporting</p>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded px-3 py-2 text-sm font-medium ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`
            }
          >
            <Icon name={l.icon} className="h-4 w-4" />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <UserInfo />
    </aside>
  )
}
