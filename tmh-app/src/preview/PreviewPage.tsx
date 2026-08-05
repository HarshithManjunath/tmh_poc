import { useMemo, useRef, useState } from 'react'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import 'survey-core/survey-core.css'
import { CANCER_TYPES, DEFAULT_CANCER_TYPE } from '../forms/cancerTypes'
import { getLatestForm } from '../forms/formRepository'
import { buildNavTree } from './navTree'
import type { NavNode } from './navTree'
import { writeJSON } from '../lib/storage/storage'

export default function PreviewPage() {
  const [cancerType, setCancerType] = useState(DEFAULT_CANCER_TYPE)
  const [nav, setNav] = useState<NavNode[]>(() => {
    const f = getLatestForm(cancerType)
    return f ? buildNavTree((f.surveyJson as any).pages ?? []) : []
  })
  const [selected, setSelected] = useState<{ path: number[] }>({ path: [0] })
  const dataRef = useRef<Record<string, any>>({})
  const [data, setData] = useState<Record<string, any>>({})
  const [savedMsg, setSavedMsg] = useState('')

  const current = useMemo(() => {
    const [pi] = selected.path
    return nav[pi] ?? null
  }, [nav, selected])

  const activePanel = useMemo(() => {
    if (!current) return null
    const childIdx = selected.path[1]
    return childIdx != null ? current.children?.[childIdx] : null
  }, [current, selected.path])

  // Build a page-scoped survey JSON: the active page, with a single panel shown.
  const surveyJson = useMemo(() => {
    if (!current) return null
    const page: any = { ...current.page, elements: [] }
    if (activePanel) {
      page.elements = [...(activePanel.panel.elements ?? [])]
      page.title = activePanel.title
    } else {
      // Page-level content: exclude top-level panels so flat pages render inline.
      page.elements = (current.page.elements ?? []).filter((el: any) => el.type !== 'panel')
    }
    return { pages: [page] }
  }, [current, activePanel])

  const surveyModel = useMemo(() => {
    if (!surveyJson) return null
    const m = new Model(surveyJson)
    m.showNavigationButtons = false
    m.onValueChanged.add(() => {
      dataRef.current = { ...dataRef.current, ...m.data }
      setData(dataRef.current)
    })
    m.data = dataRef.current
    return m
  }, [surveyJson])

  const select = (pageIdx: number, childIdx?: number) => {
    if (childIdx != null) return setSelected({ path: [pageIdx, childIdx] })
    const kids = nav[pageIdx]?.children
    setSelected({ path: kids && kids.length > 0 ? [pageIdx, 0] : [pageIdx] })
  }

  const isSelected = (n: NavNode, childIdx?: number) =>
    childIdx == null
      ? selected.path[0] === n.pageIndex
      : selected.path[0] === n.pageIndex && selected.path[1] === childIdx

  const saveResponse = () => {
    if (!current) return
    const form = getLatestForm(cancerType)
    if (!form) return
    const id = `${form.id}-${Date.now()}`
    writeJSON(`responses/${form.id}/${id}.json`, { savedAt: new Date().toISOString(), data, formId: form.id })
    setSavedMsg('Response saved')
  }

  const chooseType = (ct: string) => {
    setCancerType(ct)
    const f = getLatestForm(ct)
    setNav(f ? buildNavTree((f.surveyJson as any).pages ?? []) : [])
    setSelected({ path: [0] })
    dataRef.current = {}
    setData({})
    setSavedMsg('')
  }

  const nextInSequence = () => {
    if (!current) return
    const childIdx = selected.path[1]
    if (childIdx != null) {
      const kids = current.children ?? []
      if (childIdx + 1 < kids.length) return setSelected({ path: [current.pageIndex, childIdx + 1] })
      return setSelected({ path: [current.pageIndex] })
    }
    if (current.children && current.children.length > 0) {
      return setSelected({ path: [current.pageIndex, 0] })
    }
    if (current.pageIndex + 1 < nav.length) return setSelected({ path: [current.pageIndex + 1] })
  }

  const previousInSequence = () => {
    const childIdx = selected.path[1]
    if (childIdx == null || !current) return
    if (childIdx - 1 >= 0) setSelected({ path: [current.pageIndex, childIdx - 1] })
  }

  const proceedNextSection = () => {
    if (!current) return
    if (current.pageIndex + 1 < nav.length) setSelected({ path: [current.pageIndex + 1] })
  }

  return (
    <div className="flex h-full">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-3">
            <label className="text-sm font-medium text-slate-700">Cancer Type</label>
            <select value={cancerType} onChange={e => chooseType(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 mt-1">
              {CANCER_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
            </select>
          </div>
          <nav className="flex-1 overflow-auto p-2 space-y-1">
            {nav.map((n) => (
              <div key={n.key}>
                <button onClick={() => select(n.pageIndex)}
                  className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${isSelected(n) ? 'bg-blue-100 text-blue-900' : 'text-slate-700 hover:bg-slate-100'}`}>
                  {n.title}
                </button>
              </div>
            ))}
          </nav>
        </aside>
      {current && current.children && current.children.length > 0 && (
        <aside className="w-60 bg-slate-50 border-r border-slate-200 flex flex-col">
          <div className="p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{current.title}</p>
          </div>
          <nav className="flex-1 overflow-auto p-2 space-y-1">
            {current.children.map((c, ci) => (
              <button key={c.key} onClick={() => select(current.pageIndex, ci)}
                className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${isSelected(current, ci) ? 'bg-blue-100 text-blue-900' : 'text-slate-600 hover:bg-slate-100'}`}>
                {c.title}
              </button>
            ))}
          </nav>
        </aside>
      )}
      <main className="flex-1 overflow-auto bg-white relative">
        <div className="px-6 pt-4">
          <h1 className="text-2xl font-bold text-slate-800">Preview Form</h1>
        </div>
        {surveyModel ? (
          <Survey model={surveyModel} />
        ) : (
          <div className="p-6 text-slate-500">Select a cancer type and form version.</div>
        )}
        {savedMsg && <p className="px-6 text-green-700 text-sm">{savedMsg}</p>}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-3 sticky bottom-0 bg-white">
          {activePanel && (
            <button onClick={previousInSequence}
              className="border border-slate-300 rounded px-3 py-1.5 text-sm">Previous Question</button>
          )}
          <button onClick={saveResponse} className="border border-slate-300 rounded px-3 py-1.5 text-sm">Save Progress</button>
          <button onClick={nextInSequence} className="border border-slate-300 rounded px-3 py-1.5 text-sm">Next Question</button>
          <button onClick={proceedNextSection} className="text-white font-semibold px-4 py-2 rounded"
            style={{ backgroundColor: 'var(--brand-hex)' }}>Proceed to next section</button>
        </div>
      </main>
    </div>
  )
}
