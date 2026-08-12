export interface viewerSettings {
  weasisPath: string
  qupathPath: string
}

const WEASIS_KEY = 'tmh.settings.weasisPath'
const QUPATH_KEY = 'tmh.settings.qupathPath'

export function readViewerSettings(): viewerSettings {
  if (typeof window === 'undefined') return { weasisPath: '', qupathPath: '' }
  try {
    return {
      weasisPath: window.localStorage.getItem(WEASIS_KEY) ?? '',
      qupathPath: window.localStorage.getItem(QUPATH_KEY) ?? '',
    }
  } catch {
    return { weasisPath: '', qupathPath: '' }
  }
}

export function saveViewerSettings(settings: viewerSettings): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(WEASIS_KEY, settings.weasisPath)
    window.localStorage.setItem(QUPATH_KEY, settings.qupathPath)
  } catch {
    // Storage may be unavailable; the page remains usable without persistence.
  }
}
