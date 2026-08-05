import { NavLink } from 'react-router-dom'
import UserInfo from './UserInfo'

const links = [
  { to: '/builder', label: 'Form Builder' },
  { to: '/preview', label: 'Preview Form' },
]

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
              `block rounded px-3 py-2 text-sm font-medium ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <UserInfo />
    </aside>
  )
}
