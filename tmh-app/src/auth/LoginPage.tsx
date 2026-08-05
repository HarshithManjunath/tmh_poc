import { useState } from 'react'
import { useAuth } from './auth-context'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(email, password)) return
    setError('Invalid email or password')
  }

  return (
    <div className="min-h-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-hex)' }}>
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-1 text-slate-800">Synoptic Reporting System</h1>
        <p className="text-sm text-slate-500 mb-6">Tata Memorial Hospital</p>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email"
          className="w-full border border-slate-300 rounded px-3 py-2 mb-4" />
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="current-password"
          className="w-full border border-slate-300 rounded px-3 py-2 mb-4" />
        <button type="submit" className="w-full text-white font-semibold py-2 rounded"
          style={{ backgroundColor: 'var(--brand-hex)' }}>Sign in</button>
        <p className="text-xs text-slate-400 mt-4 text-center">Demo: admin@tmh.com / admin</p>
      </form>
    </div>
  )
}
