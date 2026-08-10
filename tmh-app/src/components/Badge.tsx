import type { ReactNode } from 'react'

export type BadgeTone = 'slate' | 'red' | 'amber' | 'green' | 'blue'

const tones: Record<BadgeTone, string> = {
  slate: 'bg-slate-100 text-slate-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
}

export default function Badge({ tone = 'slate', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}
