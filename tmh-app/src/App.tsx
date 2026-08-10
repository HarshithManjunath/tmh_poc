import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './auth/LoginPage'
import HomeLayout from './shell/HomeLayout'
import BuilderPage from './builder/BuilderPage'
import PreviewPage from './preview/PreviewPage'
import WorklistPage from './worklist/WorklistPage'
import { useAuth } from './auth/auth-context'
import { ensureSeedData } from './forms/seed'

export default function App() {
  const { user } = useAuth()
  if (user) ensureSeedData()
  if (!user) return (<Routes><Route path="/login" element={<LoginPage />} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes>)
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<HomeLayout />}>
        <Route path="/" element={<Navigate to="/builder" replace />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/worklist" element={<WorklistPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
