import { useState } from 'react'
import { readViewerSettings, saveViewerSettings } from '../cases/viewerSettings'

export default function SettingsPage() {
  const [weasisPath, setWeasisPath] = useState(readViewerSettings().weasisPath)
  const [qupathPath, setQupathPath] = useState(readViewerSettings().qupathPath)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    saveViewerSettings({ weasisPath, qupathPath })
    setSaved(true)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500">Configure the file locations used to open scans and slides.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <label htmlFor="weasis" className="mb-1 block text-sm font-medium text-slate-700">
            Weasis file location
          </label>
          <input
            id="weasis"
            value={weasisPath}
            onChange={e => setWeasisPath(e.target.value)}
            placeholder="e.g. C:\Users\someone\Downloads\000001.dcm"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          />
          <p className="mt-1 text-xs text-slate-400">DICOM path applied to radiology / scan cases.</p>
        </div>

        <div>
          <label htmlFor="qupath" className="mb-1 block text-sm font-medium text-slate-700">
            QuPath file location
          </label>
          <input
            id="qupath"
            value={qupathPath}
            onChange={e => setQupathPath(e.target.value)}
            placeholder="e.g. C:\Users\someone\Downloads\000001.svs"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          />
          <p className="mt-1 text-xs text-slate-400">SVS slide path applied to pathology / slide cases.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-[var(--brand-hex)] px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
          >
            Save
          </button>
          {saved && <span className="text-sm text-green-600">Saved</span>}
        </div>
      </div>
    </div>
  )
}
