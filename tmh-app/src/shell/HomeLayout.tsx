import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function HomeLayout() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-slate-100">
        <Outlet />
      </main>
    </div>
  )
}
