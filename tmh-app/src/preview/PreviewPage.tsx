import { useMemo, useRef, useState } from 'react'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import 'survey-core/survey-core.css'
import { CANCER_TYPES, DEFAULT_CANCER_TYPE } from '../forms/cancerTypes'
import { getLatestForm } from '../forms/formRepository'
import { buildNavTree, nodeAtPath } from './navTree'
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

  const section = useMemo(() => nav[selected.path[0]] ?? null, [nav, selected])
  const current = useMemo(() => nodeAtPath(nav, selected.path), [nav, selected])

  const ownElements = (node: NavNode | null): any[] => {
    if (!node) return []
    const src = node.panel ? node.panel.elements : node.page?.elements
    return (src ?? []).filter((el: any) => el && el.type !== 'panel')
  }

  const isPureContainer = (node: NavNode): boolean =>
    !!node.children && node.children.length > 0 && ownElements(node).length === 0

  // Build a page-scoped survey JSON for the deepest selected node.
  const surveyJson = useMemo(() => {
    if (!current) return null
    const page: any = { elements: ownElements(current), title: current.title }
    return { pages: [page] }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.key])

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

  const select = (path: number[]) => {
    let p = [...path]
    let node = nodeAtPath(nav, p)
    while (node && isPureContainer(node)) {
      p = [...p, 0]
      node = nodeAtPath(nav, p)
    }
    setSelected({ path: p })
  }

  const isNodeSelected = (path: number[]) =>
    path.length === selected.path.length && path.every((v, i) => v === selected.path[i])

  const isPathAncestor = (path: number[]) =>
    path.length < selected.path.length && path.every((v, i) => v === selected.path[i])

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

  const preOrderPaths = (root: NavNode): number[][] => {
    const paths: number[][] = []
    const walk = (node: NavNode, base: number[]) => {
      ;(node.children ?? []).forEach((c, i) => {
        const path = [...base, i]
        paths.push(path)
        walk(c, path)
      })
    }
    walk(root, [root.pageIndex])
    return paths
  }

  const nextInSequence = () => {
    if (!section) return
    const paths = preOrderPaths(section)
    if (paths.length === 0) {
      if (section.pageIndex + 1 < nav.length) select([section.pageIndex + 1])
      return
    }
    const idx = paths.findIndex(p => isNodeSelected(p))
    if (idx === -1) return select(paths[0])
    if (idx + 1 < paths.length) return select(paths[idx + 1])
    if (section.pageIndex + 1 < nav.length) return select([section.pageIndex + 1])
  }

  const previousInSequence = () => {
    if (!section) return
    const paths = preOrderPaths(section)
    const idx = paths.findIndex(p => isNodeSelected(p))
    if (idx - 1 >= 0) return select(paths[idx - 1])
  }

  const proceedNextSection = () => {
    if (!section) return
    if (section.pageIndex + 1 < nav.length) select([section.pageIndex + 1])
  }

  const renderSubs = (nodes: NavNode[] | undefined, prefix: number[]) => {
    return (nodes ?? []).map((c, ci) => {
      const path = [...prefix, ci]
      const expanded = isNodeSelected(path) || isPathAncestor(path)
      return (
        <div key={c.key}>
          <button onClick={() => select(path)}
            className={`w-full text-left px-3 py-2 rounded text-sm ${isNodeSelected(path) ? 'bg-blue-100 text-blue-900 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>
            {c.title}
          </button>
          {expanded && c.children && c.children.length > 0 && (
            <div className="ml-3 space-y-1">{renderSubs(c.children, path)}</div>
          )}
        </div>
      )
    })
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
              <button onClick={() => select([n.pageIndex])}
                className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${selected.path[0] === n.pageIndex ? 'bg-blue-100 text-blue-900' : 'text-slate-700 hover:bg-slate-100'}`}>
                {n.title}
              </button>
            </div>
          ))}
        </nav>
      </aside>
      {section && section.children && section.children.length > 0 && (
        <aside className="w-60 bg-slate-50 border-r border-slate-200 flex flex-col">
          <div className="p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{section.title}</p>
          </div>
          <nav className="flex-1 overflow-auto p-2 space-y-1">
            {renderSubs(section.children, [section.pageIndex])}
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
          <button onClick={previousInSequence}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm">Previous Question</button>
          <button onClick={saveResponse} className="border border-slate-300 rounded px-3 py-1.5 text-sm">Save Progress</button>
          <button onClick={nextInSequence} className="border border-slate-300 rounded px-3 py-1.5 text-sm">Next Question</button>
          <button onClick={proceedNextSection} className="text-white font-semibold px-4 py-2 rounded"
            style={{ backgroundColor: 'var(--brand-hex)' }}>Proceed to next section</button>
        </div>
      </main>
    </div>
  )
}
