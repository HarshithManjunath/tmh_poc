import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCases } from '../cases/seed'
import type { Case, Priority, Status } from '../cases/types'
import Badge, { type BadgeTone } from '../components/Badge'
import FilterPill from '../components/FilterPill'
import Icon from '../components/Icon'
import ProgressBar from '../components/ProgressBar'

type CategoryFilter = 'All' | 'Provisional' | 'Final' | 'Critical' | 'Emergency'
type TatFilter = 'All' | 'Emergency' | 'Crossed' | 'lt75' | 'lt100' | 'gt100'
type SortPreset = 'priority-status' | 'priority' | 'status' | 'name' | 'tat'

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  All: 'All Reports',
  Provisional: 'Provisional',
  Final: 'Final',
  Critical: 'Critical',
  Emergency: 'Emergency',
}

const TAT_LABELS: Record<TatFilter, string> = {
  All: 'All',
  Emergency: 'Emergency',
  Crossed: 'TAT Crossed',
  lt75: '<75% TAT',
  lt100: '<100% TAT',
  gt100: '>100% TAT',
}

const TAT_DOTS: Partial<Record<TatFilter, string>> = {
  Emergency: '#ef4444',
  Crossed: '#ef4444',
  lt75: '#f59e0b',
  lt100: '#22c55e',
  gt100: '#ef4444',
}

const SORT_LABELS: Record<SortPreset, string> = {
  'priority-status': 'Priority + Status',
  priority: 'Priority',
  status: 'Status',
  name: 'Patient Name',
  tat: 'TAT %',
}

const PRIORITY_RANK: Record<Priority, number> = { STAT: 0, Urgent: 1, Routine: 2 }
const STATUS_RANK: Record<Status, number> = { Pending: 0, 'In Progress': 1, 'In Review': 2, Completed: 3 }

function priorityTone(p: Priority): BadgeTone {
  return p === 'STAT' ? 'red' : p === 'Urgent' ? 'amber' : 'green'
}
function statusTone(s: Status): BadgeTone {
  return s === 'Pending' ? 'slate' : s === 'In Progress' ? 'blue' : s === 'In Review' ? 'amber' : 'green'
}
function weasisLink(path: string): string {
  const command = `$dicom:get -l "${path.replace(/\\/g, '/')}"`
  return 'weasis://?' + encodeURIComponent(command)
}

const DEPTS = ['All Departments', 'Radiology', 'Pathology'] as const
const STATUSES = ['All Status', 'Pending', 'In Progress', 'In Review', 'Completed'] as const
const PRIORITIES = ['All Priority', 'STAT', 'Urgent', 'Routine'] as const

function matchesCategory(c: Case, f: CategoryFilter): boolean {
  switch (f) {
    case 'All':
      return true
    case 'Provisional':
      return c.reportCategory === 'Provisional'
    case 'Final':
      return c.reportCategory === 'Final'
    case 'Critical':
      return c.isCritical
    case 'Emergency':
      return c.isEmergency
  }
}

function matchesTat(c: Case, f: TatFilter): boolean {
  switch (f) {
    case 'All':
      return true
    case 'Emergency':
      return c.isEmergency
    case 'Crossed':
      return c.tatPercent >= 100
    case 'lt75':
      return c.tatPercent < 75
    case 'lt100':
      return c.tatPercent >= 75 && c.tatPercent < 100
    case 'gt100':
      return c.tatPercent > 100
  }
}

export default function WorklistPage() {
  const all = useMemo(() => getCases(), [])

  const [category, setCategory] = useState<CategoryFilter>('All')
  const [tat, setTat] = useState<TatFilter>('All')
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState<string>('All Departments')
  const [status, setStatus] = useState<string>('All Status')
  const [priority, setPriority] = useState<string>('All Priority')
  const [sort, setSort] = useState<SortPreset>('priority-status')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)

  const counts = useMemo(
    () => ({
      All: all.length,
      Provisional: all.filter(c => c.reportCategory === 'Provisional').length,
      Final: all.filter(c => c.reportCategory === 'Final').length,
      Critical: all.filter(c => c.isCritical).length,
      Emergency: all.filter(c => c.isEmergency).length,
    }),
    [all],
  )

  const tatCounts = useMemo(
    () => ({
      All: all.length,
      Emergency: all.filter(c => c.isEmergency).length,
      Crossed: all.filter(c => c.tatPercent >= 100).length,
      lt75: all.filter(c => c.tatPercent < 75).length,
      lt100: all.filter(c => c.tatPercent >= 75 && c.tatPercent < 100).length,
      gt100: all.filter(c => c.tatPercent > 100).length,
    }),
    [all],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = all.filter(c => {
      if (!matchesCategory(c, category)) return false
      if (!matchesTat(c, tat)) return false
      if (dept !== 'All Departments' && c.dept !== dept) return false
      if (status !== 'All Status' && c.status !== status) return false
      if (priority !== 'All Priority' && c.priority !== priority) return false
      if (q) {
        const hay = [c.patientName, c.mrn, c.caseId, c.dmg, c.requisitionNo, c.studyRegion]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'priority':
          return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
        case 'status':
          return STATUS_RANK[a.status] - STATUS_RANK[b.status]
        case 'name':
          return a.patientName.localeCompare(b.patientName)
        case 'tat':
          return a.tatPercent - b.tatPercent
        case 'priority-status':
        default:
          return (
            PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
            STATUS_RANK[a.status] - STATUS_RANK[b.status]
          )
      }
    })
  }, [all, category, tat, search, dept, status, priority, sort])

  const allSelected = filtered.length > 0 && filtered.every(c => selected.has(c.id))
  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev)
      if (allSelected) filtered.forEach(c => next.delete(c.id))
      else filtered.forEach(c => next.add(c.id))
      return next
    })
  }
  const toggleRow = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const cycleSort = () => {
    const order: SortPreset[] = ['priority-status', 'priority', 'status', 'name', 'tat']
    setSort(prev => order[(order.indexOf(prev) + 1) % order.length])
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Allotment List</h2>
          <p className="text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'case' : 'cases'}
          </p>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map(k => (
          <FilterPill
            key={k}
            label={CATEGORY_LABELS[k]}
            count={counts[k]}
            active={category === k}
            onClick={() => setCategory(k)}
          />
        ))}
      </div>

      {/* TAT filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-400">TAT:</span>
        {(Object.keys(TAT_LABELS) as TatFilter[]).map(k => (
          <FilterPill
            key={k}
            label={TAT_LABELS[k]}
            count={tatCounts[k]}
            dot={TAT_DOTS[k]}
            active={tat === k}
            onClick={() => setTat(k)}
          />
        ))}
      </div>

      {/* Filter / search bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Icon name="search" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient, MRN, case ID, DMG, requisition..."
            className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-9 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          />
          <button title="Filters" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600:text-slate-200">
            <Icon name={expanded ? 'check' : 'filter'} className="h-4 w-4" />
          </button>
        </div>
        <select
          value={dept}
          onChange={e => setDept(e.target.value)}
          title="Department"
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
        >
          {DEPTS.map(m => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
        >
          {STATUSES.map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
        >
          {PRIORITIES.map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <button
          onClick={cycleSort}
          title="Change sort"
          className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100:bg-slate-800"
        >
          <Icon name="arrow-left" className="h-4 w-4 rotate-90" />
          {SORT_LABELS[sort]}
          <Icon name="chevron-down" className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Data table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
                </th>
                <th className="px-3 py-3 font-medium">Patient / Case</th>
                <th className="px-3 py-3 font-medium">Type / DMG</th>
                <th className="px-3 py-3 font-medium">Priority</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Hospital</th>
                <th className="px-3 py-3 font-medium">TAT %</th>
                <th className="px-3 py-3 font-medium">AI</th>
                <th className="px-3 py-3 font-medium">Critical</th>
                <th className="px-3 py-3 font-medium">View Scan</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => {
                const isExpanded = expanded === c.id
                return (
                  <RowGroup
                    key={c.id}
                    c={c}
                    selected={selected.has(c.id)}
                    onToggle={() => toggleRow(c.id)}
                    expanded={isExpanded}
                    onExpand={() => setExpanded(isExpanded ? null : c.id)}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-400">
            No cases match the current filters.
          </div>
        )}
      </div>
    </div>
  )
}

function RowGroup({
  c,
  selected,
  onToggle,
  expanded,
  onExpand,
}: {
  c: Case
  selected: boolean
  onToggle: () => void
  expanded: boolean
  onExpand: () => void
}) {
  const firstRow = (
    <tr className={selected ? 'bg-blue-50' : 'hover:bg-slate-50:bg-slate-800/40'}>
      <td className="px-4 py-3">
        <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Select ${c.patientName}`} />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Icon name="user" className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-800">
              <Link
                to={`/preview?type=${encodeURIComponent(c.diseaseType)}&caseId=${c.id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {c.patientName}
              </Link>
              <span className="ml-1.5 text-xs font-normal text-slate-400">
                {c.sex}/{c.age}y
              </span>
            </p>
            <p className="text-xs text-slate-500">
              {c.caseId} — {c.studyRegion} — {c.requisitionNo}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <p className="font-medium text-slate-700">{c.diseaseType}</p>
        <p className="text-xs text-slate-500">{c.dmg}</p>
      </td>
      <td className="px-3 py-3">
        <Badge tone={priorityTone(c.priority)}>{c.priority}</Badge>
      </td>
      <td className="px-3 py-3">
        <Badge tone={statusTone(c.status)}>{c.status}</Badge>
      </td>
      <td className="max-w-[140px] truncate px-3 py-3 text-slate-600" title={c.hospital}>
        {c.hospital}
      </td>
      <td className="px-3 py-3">
        <ProgressBar value={c.tatPercent} />
      </td>
      <td className="px-3 py-3">
        {c.aiFindingCount == null ? (
          <span className="text-slate-400">--</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-slate-700">
            <Icon name="sparkles" className="h-3.5 w-3.5 text-amber-500" />
            {c.aiFindingCount}
          </span>
        )}
      </td>
      <td className="px-3 py-3">
        {c.isCritical ? (
          <Icon name="alert-triangle" className="h-4 w-4 text-red-500" title="Critical" />
        ) : (
          <Icon name="flag" className="h-4 w-4 text-slate-300" title="Not critical" />
        )}
      </td>
      <td className="px-3 py-3">
        {c.scanUrl ? (
          <a
            href={weasisLink(c.scanUrl)}
            title="Open in Weasis"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            View Scan
          </a>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="px-3 py-3">
        <button
          onClick={onExpand}
          title="Details"
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600:bg-slate-700:text-slate-200"
        >
          <Icon name="chevron-down" className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </td>
    </tr>
  )

  return (
    <>
      {firstRow}
      {expanded && (
        <tr className="bg-slate-50">
          <td />
          <td colSpan={10} className="px-4 py-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:grid-cols-4">
              <Detail label="MRN" value={c.mrn} />
              <Detail label="Requisition" value={c.requisitionNo} />
              <Detail label="Hospital" value={c.hospital} />
              <Detail label="Study Region" value={c.studyRegion} />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-slate-700">{value}</p>
    </div>
  )
}
