# Markdown Form Template Support Design

Date: 2026-08-12
Status: Approved by user

## Overview

Extend the project-level PDF-to-SurveyJS skill at `.agents/skills/pdf-to-surveyjs/SKILL.md`
so it also accepts a Markdown form template as an equally valid source. A single supplied
source, whether PDF or Markdown, is treated as the complete source of truth and follows the
same extraction, inventory, mapping, clarification, validation, save, integration, and
raw JSON output workflow.

## Decisions

- Keep the skill at `.agents/skills/pdf-to-surveyjs/SKILL.md`.
- Accept either a PDF or a Markdown form template as the supplied source.
- Treat the single provided source as complete and authoritative.
- Do not require or reconcile a paired PDF when Markdown is provided, and vice versa.
- Reuse all existing extraction, SurveyJS modeling, clarification, validation, save,
  application-integration, and raw JSON output rules for both formats.
- Update source-tracking language ("PDF", "page-by-page") into format-neutral language where
  it denotes the source document, preserving the meaning of a complete final comparison.
- Preserve all existing behavior for cancer-type registration, seeding, Builder fallback,
  mock-case creation, exclusions, and raw JSON output.

## Workflow

The skill will continue to require a full inspection of the supplied source before
generating JSON. For a Markdown source the agent will:

1. Confirm a PDF or Markdown template was supplied and identify the source document.
2. Resolve `formName` and `cancerType` before generating anything.
3. Inspect the complete source, recording every section, label, control, option, required
   indicator, note, repeated group, and conditional cue in source order.
4. Build an internal inventory before modeling.
5. Resolve every material ambiguity with focused, one-at-a-time questions.
6. Generate and validate the SurveyJS JSON, then save it.
7. Perform a final comparison against the complete source.
8. Apply the application integration steps (catalog, seeding, Builder fallback, mock case).
9. Run project validation and consistency checks.
10. Return the generated object as raw JSON only.

## Format Neutrality

Where the skill currently says "PDF template", "inspect the PDF", "page-by-page", or
"against the complete PDF", the wording must become source-neutral, for example
"supplied PDF or Markdown template", "inspect the complete source", or "against the complete
source". This is a documentation and precision change only; it does not alter the
SurveyJS mapping rules, validation checks, or application integration behavior.

Markdown-specific structure (headings, tables, nested lists) is read for its semantic
content: section titles, field labels, control choices, required markers, notes, repeated
groups, and dependencies. It is mapped to SurveyJS using the same conservative rules as a
PDF source.

## Validation

The skill must require that, before returning JSON:

- The supplied source (PDF or Markdown) was fully inspected.
- The result parses as valid JSON and is a usable SurveyJS root object.
- All source sections, fields, options, notes, ordering, and explicit required indicators
  are represented.
- The final structure and wording match the complete source after a last comparison.

## Explicit Exclusions

- Reconciling or merging a PDF and Markdown supplied together.
- Preferring one format over another when both types are acceptable independently.
- Altering SurveyJS mapping, application integration, catalog, seeding, Builder fallback,
  mock-case, clarification, or raw JSON output rules.
- Adding runtime discovery, generated registries, patient lookup, auto-population,
  calculations, integrations, or PDF export.