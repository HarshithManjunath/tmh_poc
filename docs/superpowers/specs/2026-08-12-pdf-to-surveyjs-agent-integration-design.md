# PDF-to-SurveyJS Agent Integration Design

Date: 2026-08-12
Status: Approved by user

## Overview

Extend the project-level PDF-to-SurveyJS skill so a generated form is immediately
available in the TMH application. After producing and saving the SurveyJS JSON, the agent
will register the form's cancer type, seed the form into the existing LocalStorage-backed
form repository, and add one representative mock case to the worklist data.

The workflow remains agent-agnostic. It will use the repository's existing static catalog,
seed, Builder fallback, and mock-case patterns rather than adding a runtime-specific
registry or discovery mechanism.

## Decisions

- Keep the skill at `.agents/skills/pdf-to-surveyjs/SKILL.md`.
- Continue saving the generated definition as
  `tmh-app/src/forms/generatedForms/<form-name>.json`.
- Resolve a `formName` for the filename and a `cancerType` for the application catalog.
- Default `cancerType` to the resolved form name; ask the user only when the dropdown label
  should differ.
- Add the cancer type exactly once to `tmh-app/src/forms/cancerTypes.ts`.
- Import and seed the generated JSON from `tmh-app/src/forms/seed.ts` when no saved version
  exists for that cancer type.
- Update `tmh-app/src/builder/BuilderPage.tsx` fallback behavior when the generated form
  requires a fallback entry outside normal seed initialization.
- Add one deterministic fictional case to `tmh-app/src/cases/seed.ts` using the existing
  `Case` interface and the resolved cancer type as `diseaseType`.
- Avoid duplicate catalog entries, seed entries, or mock cases when the workflow is run
  against an already integrated cancer type.
- Preserve the existing form repository and LocalStorage behavior.
- Do not modify unrelated existing cancer types or repair unrelated pre-existing data
  inconsistencies during this workflow.

## Workflow

After the PDF extraction, clarification, SurveyJS modeling, and validation steps from the
base skill are complete, the agent will:

1. Resolve `formName` from the source or user clarification. Ask for a valid filename when
   the name is missing or contains filesystem-invalid characters.
2. Resolve `cancerType` from `formName`, asking only when the desired dropdown label differs.
3. Save the completed JSON to `tmh-app/src/forms/generatedForms/<form-name>.json`.
4. Inspect `tmh-app/src/forms/cancerTypes.ts` and add `cancerType` only if it is absent.
5. Import the generated JSON in `tmh-app/src/forms/seed.ts` and add an idempotent seed
   branch using `listForms(cancerType)` and `saveForm(cancerType, generatedForm)`.
6. Inspect `tmh-app/src/builder/BuilderPage.tsx` and add or update the generated form's
   fallback mapping if the existing fallback structure requires it.
7. Inspect `tmh-app/src/cases/seed.ts` and add one deterministic fictional case with
   `diseaseType: cancerType`, only if a case for that cancer type is not already present.
8. Run the project's available validation command, at minimum the `tmh-app` TypeScript/Vite
   build when the project scripts are available.
9. Review the changed source files to confirm the new dropdown option, seed import/branch,
   fallback, generated JSON path, and mock case all use the same resolved cancer type.
10. Return the generated SurveyJS object as raw JSON only, after all requested files are
    updated and validation succeeds.

## Application Integration

### Cancer Type Catalog

The cancer type must be a string entry in `CANCER_TYPES`. The agent will preserve the
existing ordering unless the user specifies a placement. It will not add duplicate strings.

### Form Seeding

The generated JSON will be imported from its `generatedForms` path and seeded only when
`listForms(cancerType)` returns no saved versions. This keeps startup idempotent and lets
the existing Builder load the latest saved form through `getLatestForm`.

### Builder Fallback

If the Builder uses an explicit `seedFor` mapping, the agent will add the generated form to
that mapping. The fallback must return the generated JSON for the new cancer type rather
than silently returning the Neck form. The agent will not replace the existing saved-form
lookup behavior.

### Mock Case

The new case must satisfy every required field in `tmh-app/src/cases/types.ts`, use fictional
deterministic values, and identify the generated cancer type through `diseaseType`. Values
should be clinically plausible for the source form without inventing form responses or
patient integrations. The case should be appended or placed consistently with the existing
seed data and must not duplicate an existing cancer-type case when rerun.

## Validation

Before returning the JSON, the agent will verify:

- The generated file parses as valid JSON and remains a usable SurveyJS root object.
- The cancer type appears exactly once in the catalog.
- The generated JSON is imported by the seed module and guarded by an empty-list check.
- The Builder fallback returns the generated form for the resolved cancer type when needed.
- The mock case satisfies the `Case` interface and uses the same cancer-type label.
- The generated form filename, catalog label, seed key, fallback key, and mock-case
  `diseaseType` are internally consistent.
- `npm run build` from `tmh-app` passes when dependencies and scripts are available.
- No unrelated application files or existing cancer-type behavior were changed.

## Clarification Protocol

The agent will ask one focused question at a time when:

- The form name cannot be safely used as a filename.
- The desired cancer-type label differs from the form name.
- The PDF's form content remains materially ambiguous under the base skill's rules.

The agent will generate representative mock-case values without asking for patient details.
It must not use real patient information from the source PDF unless the user explicitly
requests that behavior.

## Explicit Exclusions

- Runtime directory scanning or dynamic form discovery.
- A new generated registry abstraction.
- Automatic patient lookup, form-response auto-population, calculations, integrations, or
  PDF export.
- Repairing unrelated existing catalog, seed, or mock-data defects.
- Duplicate cancer-type catalog entries, seed branches, or mock cases.
