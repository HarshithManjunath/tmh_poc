# PDF-to-SurveyJS Agent Design

Date: 2026-08-06
Status: Approved by user

## Overview

Add a project-level, agent-agnostic skill that converts a supplied PDF form template
into a SurveyJS JSON form definition. The skill will document the same careful extraction
and modeling process used for the prostate reporting template, but will remain generic so
it can process future clinical or non-clinical templates.

The skill will return the generated JSON directly to the user. It will not save the JSON,
seed it into the application, modify application source, or depend on a specific agent
runtime.

## Decisions

- Store the workflow at `.agents/skills/pdf-to-surveyjs/SKILL.md`.
- Keep the instructions agent-agnostic and avoid OpenCode-specific configuration,
  commands, tools, or APIs.
- Accept a user-provided PDF as the source template.
- Inspect the complete PDF before modeling the form.
- Preserve source wording, section order, response choices, and visible relationships.
- Ask focused clarification questions one at a time when the source is ambiguous.
- Do not return JSON until unresolved ambiguities are clarified.
- Return one raw, valid SurveyJS JSON object only, with no Markdown fence or explanation.
- Do not save, seed, persist, calculate, integrate, or export the generated form.

## Workflow

The skill will direct the agent to:

1. Confirm that a PDF template was supplied and identify the source document.
2. Inspect every page, including text, tables, checkboxes, radio controls, notes,
   repeated groups, and conditional cues.
3. Build an internal inventory of sections, fields, labels, response controls, options,
   required indicators, repetition rules, and dependencies before writing JSON.
4. Map the inventory to SurveyJS pages and question types conservatively.
5. Use `text` for short free text or numeric-style entries when no specialized behavior is
   explicit, `comment` for narrative responses, `date` for explicit date fields,
   `radiogroup` for single-choice controls, and `checkbox` for multi-select controls.
6. Use `paneldynamic` only when the source clearly represents a repeatable group, and
   preserve any source-supported minimum or maximum where determinable.
7. Encode conditional visibility with `visibleIf` when the source visibly ties a field to
   a selection such as Present, Yes, or Other.
8. Ask one focused question for any unresolved label, option, control type, requiredness,
   dependency, or repetition rule. Resume extraction after the answer.
9. Validate the completed object before returning it.

## SurveyJS Modeling Rules

- Use stable, unique camelCase names for questions and panels.
- Keep the source's visible labels and option text exact unless the user clarifies a
  correction.
- Preserve section and field order from the PDF.
- Mark a field `isRequired: true` only when requiredness is explicit in the source or
  confirmed by the user; otherwise leave it optional.
- Represent source notes as descriptions or non-response text, not as invented response
  fields.
- Do not invent calculations, auto-population, patient lookup, external integrations,
  PDF export, or validation behavior absent from the source.
- Do not convert a visual layout detail into application behavior unless the source defines
  a response or relationship that SurveyJS can represent.

## Clarification Protocol

When the PDF does not provide enough information to make a reliable modeling decision,
the agent will pause and ask one concise question. Questions should identify the exact
field or relationship in doubt and offer concrete alternatives where possible. Examples
include whether a control allows one or multiple selections, whether a group repeats, or
whether an unlabeled choice should be modeled as `Other`.

The agent must not silently resolve material ambiguity through assumptions. It may use
conservative defaults for non-material implementation details, such as internal names,
while preserving the source-facing text.

## Output Contract

The final response must contain exactly one raw JSON object representing a SurveyJS form.
It must be parseable as JSON and must not be wrapped in Markdown fences or preceded by
prose. The agent will return the object only after the clarification protocol and quality
checks are complete.

## Quality Checks

Before returning JSON, the agent will verify:

- The response parses as valid JSON.
- The root object is a usable SurveyJS form definition.
- Every question and panel has a unique name.
- Item types and properties are valid SurveyJS concepts.
- All source sections, fields, options, and explicit required indicators are represented.
- Conditional fields reference existing question names and valid values.
- Repeated groups are modeled only where supported by the source.
- No unsupported calculations, integrations, persistence, seeding, or export behavior was
  introduced.
- The final structure and wording were reviewed against the complete PDF.

## Explicit Exclusions

- Saving the JSON to the repository or filesystem.
- Registering or seeding the form in `tmh-app`.
- Changing the application builder, preview, repository, or persistence code.
- Calling OpenCode-specific tools, APIs, plugins, or configuration.
- Returning a partial JSON draft before clarification.
- Guessing material field semantics that are not supported by the source or user input.
