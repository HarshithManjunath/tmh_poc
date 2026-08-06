import { saveForm, listForms } from './formRepository'
import { NECK_FORM } from './seedForms'
import { PROSTATE_FORM } from './prostateForm'

export function ensureSeedData(): void {
  if (listForms('Neck').length === 0) {
    saveForm('Neck', NECK_FORM)
  }
  if (listForms('Prostate').length === 0) {
    saveForm('Prostate', PROSTATE_FORM)
  }
}
