---
name: pdf-to-surveyjs
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
   and only then return the object.

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
- No seeding, registration, application-source edits, calculation, integration, PDF export,
  or runtime dependency was introduced.
- The final structure and wording match the PDF after a last page-by-page comparison.

## Save and Return

Create `tmh-app/src/forms/generatedForms/` if it does not exist. Save the completed object as
`tmh-app/src/forms/generatedForms/<form-name>.json`, using the resolved form name and a `.json`
extension. Return exactly the same object as raw JSON only: no Markdown fence, prose, status
message, or additional object. If clarification is needed, return the single focused question
instead of JSON and resume only after the user answers.

## Red Flags

Stop and ask the user when you are about to:

- infer a control's single-versus-multiple selection behavior;
- infer requiredness from position, styling, or convention;
- invent an option, label, dependency, repeat rule, calculation, or default;
- omit a page, note, option, or visually subtle field because it is inconvenient to model;
- generate JSON before the complete inspection or return a partial JSON draft.
