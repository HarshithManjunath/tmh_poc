import type { Case } from '../cases/types'
import Icon from './Icon'

export default function PatientContext({ caseData }: { caseData: Case }) {
  const rows: Array<[string, string]> = [
    ['Age / Sex', `${caseData.age}y / ${caseData.sex}`],
    ['Case ID', caseData.caseId],
    ['Hospital', caseData.hospital],
    ['Center', caseData.center],
    ['Dept', caseData.dept],
    ['Referring', caseData.referring],
    ['Study Date', caseData.studyDate],
  ]

  return (
    <div className="w-64 shrink-0 space-y-4 overflow-y-auto border-l border-slate-200 bg-slate-50 p-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <Icon name="user" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-800">{caseData.patientName}</p>
            <p className="truncate text-xs text-slate-500">{caseData.requisitionNo}</p>
          </div>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-2">
              <dt className="shrink-0 text-slate-400">{k}</dt>
              <dd className="truncate text-right font-medium text-slate-700">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Icon name="file-text" className="h-4 w-4" />
          Clinical History
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{caseData.clinicalHistory}</p>
      </div>
    </div>
  )
}