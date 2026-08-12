---
name: pdf-to-surveyjs
description: Use when a user supplies a PDF form template and requests a SurveyJS JSON definition.
---

# PDF to SurveyJS

Convert a supplied PDF form template into one faithful, usable SurveyJS JSON object. Treat
the PDF as the source of truth: preserve what it says and do not invent behavior that it
does not define.

## Workflow

1. Confirm that a PDF template was supplied and identify the document to inspect.
2. Determine the form name from the PDF. If it is unclear, missing, or cannot be used as a
   filename, ask the user for a valid form name before generating anything.
3. Inspect every page completely before writing the SurveyJS definition. Record, in source
   order, every section, label, control, option, required indicator, note, repeated group,
   and conditional cue. Include text in tables, headers, footers, and annotations when it
   describes the form or its responses.
4. Build an internal inventory before modeling. For each response, record its exact visible
   label and options, control cardinality, requiredness evidence, source order, and any
   dependency or repetition evidence.
5. Map the inventory conservatively to SurveyJS pages and elements.
6. Resolve every material ambiguity before producing JSON. Ask one focused question at a
   time, naming the exact field or relationship in doubt and offering concrete alternatives
   where useful. Do not silently guess, return a partial draft, or continue past an
   unresolved control type, option, requiredness, dependency, or repetition rule.
7. Validate the completed object, save it, compare it with the complete PDF one final time,
   and only then integrate it into the application and return the object.

## Mapping Rules

| Source meaning | SurveyJS type or treatment |
| --- | --- |
| Short free-text or numeric-style entry without explicit specialized behavior | `text` |
| Narrative or multi-line response | `comment` |
| Explicit date field | `date` |
| Exactly one choice | `radiogroup` |
| Zero or more choices | `checkbox` |
| Clearly repeatable group | `paneldynamic` |
| Source-defined dependency | `visibleIf` |
| Instructions, notes, or explanatory text | Description or non-response text, not an invented question |

Use `paneldynamic` only when the source clearly supports repetition. Preserve source-supported
minimum and maximum counts when they can be determined. Use `visibleIf` only for a dependency
shown or explicitly represented by the source, and reference the existing question name and
the source value exactly.

## Modeling Contract

- Use unique, stable camelCase names for every question and panel. Names are internal only;
  keep source-facing labels and option text exact.
- Preserve the PDF's section, field, and option order.
- Set `isRequired: true` only when the source explicitly marks the response required or the
  user confirms it. Leave requiredness unspecified otherwise.
- Represent all source sections, response fields, options, explicit required indicators,
  notes, supported repeatable groups, and supported conditional relationships.
- Do not turn visual layout details into behavior unless the source defines a response or
  relationship that SurveyJS can represent.
- Do not invent calculations, defaults, validation, auto-population, patient lookup,
  integrations, or other behavior absent from the source.

## Application Integration

After the generated JSON has passed the complete PDF comparison, integrate it in this exact order.
The generation and save occur in step 2 before any application source is edited:

1. Resolve `formName` for the filename and `cancerType` for the application. Use the generated
    filename under `tmh-app/src/forms/generatedForms/<form-name>.json` as `formName`. Default
    `cancerType` to `formName`; ask one focused question only when the desired dropdown label
    should differ. The filename must match `formName`. Use the resolved `cancerType` consistently
    as the catalog entry, seed key, Builder fallback key, and `Case.diseaseType`; `cancerType` may
    differ from `formName` when the user clarifies that the application label should differ.
2. Generate and validate the SurveyJS JSON, then save it to
   `tmh-app/src/forms/generatedForms/<form-name>.json` before changing application files.
3. Inspect `tmh-app/src/forms/cancerTypes.ts` and add `cancerType` exactly once to its catalog,
   preserving the existing order unless the user specifies placement. Do not alter unrelated
   entries.
4. Before editing `tmh-app/src/forms/seed.ts`, inspect it for an existing import of the generated
    JSON and an existing seed branch for `cancerType`. Preserve existing entries, and do not add
    duplicate imports or branches when rerunning the workflow. Import the generated JSON from its
    `generatedForms` path when it is not already imported. Seed it idempotently: when
    `listForms(cancerType)` is empty, call
    `saveForm(cancerType, generatedForm)`; otherwise leave the saved versions unchanged. If the
    build rejects JSON imports, make the smallest compatible configuration adjustment, such as
    enabling JSON module resolution in `tmh-app/tsconfig.app.json`.
5. Inspect `tmh-app/src/builder/BuilderPage.tsx`. If it has an explicit `seedFor` mapping, add
   the generated form under `cancerType` so `getLatestForm(cancerType)?.surveyJson ??
   seedFor(cancerType)` cannot silently fall back to the Neck form. Preserve saved-form lookup.
6. Inspect `tmh-app/src/cases/seed.ts` and `tmh-app/src/cases/types.ts`. Add exactly one fictional,
   deterministic case only when no existing case uses `cancerType`. It must satisfy every
   `Case` property, use `diseaseType: cancerType`, avoid real PDF patient details, and avoid
   duplicate cases on reruns.
7. Validate the integration, perform a consistency review, and run `npm run build` from
    `tmh-app`, or the available project validation command if that script is unavailable. Report
    unrelated pre-existing validation failures separately; do not silently treat a failed command
    as complete validation. Return the generated object as raw JSON only. Do not add runtime
    directory scanning or a generated registry abstraction.

## Validation Before Return

Check all of the following against the complete PDF:

- The result is valid JSON and is one usable SurveyJS root object, normally containing
  `pages` with ordered page objects and ordered `elements`.
- Every question and panel has a unique name, and every name is stable camelCase.
- Every item type and property used is a valid SurveyJS concept.
- All source coverage, wording, choices, notes, ordering, and explicit required indicators
  are present.
- Every `visibleIf` references an existing question and valid source-supported value.
- Every `paneldynamic` corresponds to a source-supported repeatable group and preserves
  determinable count limits.
- The output filename matches the resolved form name and uses the `.json` extension.
- The cancer type appears exactly once in the catalog.
- The generated JSON import path is correct and its seed is guarded by an empty-list check using
  `listForms(cancerType)` before `saveForm(cancerType, generatedForm)`.
- The Builder fallback maps `cancerType` to the generated form when an explicit `seedFor` mapping
  exists.
- The mock case conforms to every `Case` property, uses `diseaseType: cancerType`, and is not a
  duplicate.
- The output filename matches `formName`; the catalog label, seed key, Builder key, and mock-case
  disease type match `cancerType`. `cancerType` may differ from `formName` when clarified by the
  user.
- Before editing `tmh-app/src/forms/seed.ts`, any existing generated JSON import and
  `cancerType` seed branch were checked, existing entries were preserved, and reruns do not add
  duplicate imports or branches.
- `npm run build` was run from `tmh-app`, or the available project validation command when that
  script is unavailable. Any unrelated pre-existing failure is reported separately from
  integration validation.
- No patient lookup, auto-population, calculation, integration beyond this static registration
  and seeding workflow, PDF export, runtime directory scanning, or generated registry abstraction
  was introduced.
- The final structure and wording match the PDF after a last page-by-page comparison.

## Save and Return

Create `tmh-app/src/forms/generatedForms/` if it does not exist. Save the completed object as
`tmh-app/src/forms/generatedForms/<form-name>.json`, using the resolved form name and a `.json`
extension. After completing the application integration and consistency review, return exactly
the same object as raw JSON only: no Markdown fence, prose, status message, or additional object.
If clarification is needed, return the single focused question instead of JSON and resume only
after the user answers.

## Red Flags

Stop and ask the user when you are about to:

- infer a control's single-versus-multiple selection behavior;
- infer requiredness from position, styling, or convention;
- invent an option, label, dependency, repeat rule, calculation, or default;
- omit a page, note, option, or visually subtle field because it is inconvenient to model;
- generate JSON before the complete inspection or return a partial JSON draft.
