# Prostate Cancer Reporting Template Design

Date: 2026-08-06
Status: Approved by user

## Overview

Add the supplied Prostate Cancer Reporting Template as a new pre-seeded cancer type in
the existing SurveyJS-based form builder and preview flow. The implementation will use
SurveyJS JSON and the existing LocalStorage form persistence. It will replicate the
template fields and support conditional rendering for fields that are only applicable
when a clinician selects Present.

## Decisions

- Add a new `Prostate` cancer type alongside the existing cancer types.
- Use a pre-seeded SurveyJS JSON definition, not a separate custom renderer.
- Preserve the existing Neck form and builder/preview architecture.
- Replicate the PDF's sections, field labels, response controls, and choices.
- Use a dynamic lesion panel with Add/Remove controls and a maximum of four lesions.
- Keep all fields optional because the PDF does not define required validation.
- Skip auto-population of case details, patient details, prostate volume, and PSA density.
- Skip calculations, patient lookup, external integrations, and PDF printing.
- Do not add a verification-plan section to this design or implementation scope.

## Form Structure

The Prostate form will contain these top-level SurveyJS pages:

1. Case Information: Case Number, Name, Age/Sex, and Name of the Doctor.
2. 1. Clinical Details: PSA, Free PSA, Free to Total PSA Ratio, Biopsy, Treatment
   History, and Bone Scan.
3. 2. Technique: Modality-MRI, Field Strength, IV Contrast, and PIQUAL.
4. 3. Comparison: Date of Document and Modality of Comparison Study.
5. 4. Findings - Prostate and Seminal Vessels: Hemorrhage, Prostate Size, Prostate
   Volume CC, PSA Density, Lesions, Nodes, Metastases, and Kidney and Ureters.
6. 5. Impression: Volume of Prostate, PSA Density, PIRADS, Suggested Site for Targeted
   Biopsy, MRI Zonal Location, T Stage, N Stage, M Stage, and Metastatic Disease.

The PDF's vendor remarks will be represented as question descriptions or notes where
useful. They will not become separate clinician response fields.

## SurveyJS Controls

- Use `text` for short free-text and numeric-style entries where no specialized behavior
  is required.
- Use `comment` for Biopsy, Treatment History, Bone Scan, Other Significant Findings,
  and other narrative fields.
- Use `date` for Date of Document.
- Use `radiogroup` for single-choice fields, including Yes/No, Field Strength, PIQUAL,
  PIRADS, staging, and other mutually exclusive choices.
- Use `checkbox` for multi-select fields, including local extent, lesion location,
  zonal location, sectoral location, metastatic sites, and metastatic disease.

## Conditional Behavior

The following SurveyJS `visibleIf` rules will be included:

- Node laterality questions appear only when Nodes is `Present`.
- Metastatic site choices appear only when Metastases is `Present`.
- The Other metastasis text field appears only when the Other metastatic site option is
  selected.

The conditional fields will remain optional and will not be cleared or calculated by
custom application code.

## Lesion Behavior

Lesions will be represented by a SurveyJS `paneldynamic` named for the lesion collection.
Each panel will include the complete lesion field set from the PDF:

1. Size
2. T2 Signal Intensity
3. T2 Homogeneity
4. T2 Margins
5. T2 Shape
6. DWI Score
7. ADC Value
8. CE-MRI
9. Local Extent
10. Location
11. MRI Zonal Location
12. Sectoral Location
13. Local Extent

The panel will allow zero to four entries. SurveyJS will provide the add/remove controls,
and the JSON will enforce `maxPanelCount: 4`.

## Integration

- Add `Prostate` to the existing cancer-type catalog.
- Add `PROSTATE_FORM` to the seed form definitions.
- Update the existing fallback selection so a Prostate form loads when no saved version
  exists for that cancer type.
- Keep saved versions and response persistence on the existing repository paths and
  data model.
- Do not change the custom preview navigation shell; it will derive sections and nested
  content from the new SurveyJS JSON in the same way as existing forms.

## Explicit Exclusions

- Auto-populating Name or Age/Sex from Case Number.
- Auto-populating Volume of Prostate or PSA Density.
- Computing prostate volume or PSA density.
- Patient, case, or imaging-system lookup.
- Required-field validation not specified by the PDF.
- PDF export or pixel-perfect reproduction of the source document layout.
