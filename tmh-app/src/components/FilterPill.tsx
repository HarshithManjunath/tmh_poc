export default function FilterPill({
  label,
  count,
  active,
  dot,
  onClick,
}: {
  label: string
  count?: number
  active: boolean
  dot?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'border-transparent text-white shadow-sm'
          : 'border-slate-300 text-slate-600 hover:bg-slate-100'
      }`}
      style={active ? { backgroundColor: 'var(--brand-hex)' } : undefined}
    >
      {dot && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />}
      <span>{label}</span>
      {count !== undefined && (
        <span className={`text-xs ${active ? 'text-white/80' : 'text-slate-400'}`}>({count})</span>
      )}
    </button>
  )
}
