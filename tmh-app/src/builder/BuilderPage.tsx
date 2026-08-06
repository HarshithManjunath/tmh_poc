import { useState } from 'react'
import { CANCER_TYPES, DEFAULT_CANCER_TYPE } from '../forms/cancerTypes'
import { saveForm, listForms, getLatestForm } from '../forms/formRepository'
import { NECK_FORM } from '../forms/seedForms'
import { PROSTATE_FORM } from '../forms/prostateForm'
import SurveyCreatorWrapper from './SurveyCreatorWrapper'

const seedFor = (type: string): object => type === 'Prostate' ? PROSTATE_FORM : NECK_FORM

export default function BuilderPage() {
  const [cancerType, setCancerType] = useState(DEFAULT_CANCER_TYPE)
  const [surveyJson, setSurveyJson] = useState<object>(() => getLatestForm(DEFAULT_CANCER_TYPE)?.surveyJson ?? seedFor(DEFAULT_CANCER_TYPE))
  const [savedMsg, setSavedMsg] = useState('')
  const versions = listForms(cancerType)

  const selectType = (ct: string) => {
    setCancerType(ct)
    setSurveyJson(getLatestForm(ct)?.surveyJson ?? seedFor(ct))
    setSavedMsg('')
  }

  const save = () => {
    saveForm(cancerType, surveyJson)
    setSavedMsg(`Saved new version for ${cancerType}`)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Form Builder</h1>
      <label className="block text-sm font-medium text-slate-700 mb-1">Cancer Type</label>
      <select
        value={cancerType}
        onChange={e => selectType(e.target.value)}
        className="border border-slate-300 rounded px-3 py-2 mb-4 bg-white"
      >
        {CANCER_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
      </select>
      {savedMsg && <p className="text-green-700 text-sm mb-2">{savedMsg}</p>}
      <SurveyCreatorWrapper json={surveyJson} onChange={setSurveyJson} />
      <button onClick={save} className="mt-4 text-white font-semibold px-4 py-2 rounded" style={{ backgroundColor: 'var(--brand-hex)' }}>
        Save Form (new version)
      </button>
      <div className="mt-4">
        <h2 className="font-semibold text-slate-700 mb-2">Saved versions ({versions.length})</h2>
        <ul className="space-y-1">
          {versions.map(v => (
            <li key={v.id} className="text-sm text-slate-600">{v.fileName}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
