export default function ProgressBar({ value }: { value: number }) {
  const color = value > 100 ? '#ef4444' : value >= 100 ? '#f59e0b' : value >= 75 ? '#f59e0b' : '#22c55e'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs tabular-nums text-slate-600">{value}%</span>
    </div>
  )
}
