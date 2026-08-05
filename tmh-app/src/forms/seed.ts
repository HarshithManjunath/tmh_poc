import { saveForm, listForms } from './formRepository'
import { NECK_FORM } from './seedForms'

export function ensureSeedData(): void {
  if (listForms('Neck').length === 0) {
    saveForm('Neck', NECK_FORM)
  }
}
