import { readJSON, listKeys } from '../lib/storage/storage'
import type { SavedForm } from './formModel'

const KEY_PREFIX = 'forms/'

export function makeFileName(cancerType: string, date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${cancerType}_${y}-${m}-${d}_${date.getTime()}.json`
}

export function saveForm(cancerType: string, surveyJson: object): SavedForm {
  const now = new Date()
  const form: SavedForm = {
    id: `${cancerType}-${now.getTime()}`,
    cancerType,
    savedAt: now.toISOString(),
    fileName: makeFileName(cancerType, now),
    surveyJson,
  }
  // Non-encoded key with the filename; the storage helper prefixes with 'tmh:'.
  localStorage.setItem('tmh:' + KEY_PREFIX + cancerType + '/' + form.fileName, JSON.stringify(form))
  return form
}

export function listForms(cancerType: string): SavedForm[] {
  const keys = listKeys(KEY_PREFIX + cancerType + '/')
  const forms: SavedForm[] = []
  for (const k of keys) {
    const f = readJSON<SavedForm>(k)
    if (f) forms.push(f)
  }
  return forms.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
}

export function getLatestForm(cancerType: string): SavedForm | null {
  const forms = listForms(cancerType)
  return forms.length ? forms[0] : null
}

export function getForm(id: string): SavedForm | null {
  const forms = listAll()
  return forms.find(f => f.id === id) ?? null
}

export function listAll(): SavedForm[] {
  const all: SavedForm[] = []
  for (const ct of ['Neck', 'Breast', 'Skin', 'Brain']) {
    all.push(...listForms(ct))
  }
  return all.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
}
