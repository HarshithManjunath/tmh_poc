export type Dept = 'Radiology' | 'Pathology'
export type Priority = 'STAT' | 'Urgent' | 'Routine'
export type Status = 'Pending' | 'In Progress' | 'In Review' | 'Completed'
export type ReportCategory = 'Provisional' | 'Final'

export interface Case {
  id: string
  patientName: string
  sex: 'M' | 'F'
  age: number
  mrn: string
  caseId: string
  studyRegion: string
  requisitionNo: string
  dept: Dept
  diseaseType: string
  dmg: string
  center: string
  referring: string
  studyDate: string
  clinicalHistory: string
  priority: Priority
  status: Status
  reportCategory: ReportCategory
  hospital: string
  tatPercent: number
  isEmergency: boolean
  isCritical: boolean
  aiFindingCount: number | null
  scanUrl?: string
}
