# View Scan Column with Weasis Launch — Design

Date: 2026-08-11

## Goal

Add a `View Scan` column to the Worklist page table. For Radiology records, the
cell links to a local DICOM file (`000001.dcm`) and opens it in the installed
Weasis desktop viewer. Pathology records show a dash.

## Context

- Worklist table lives in `tmh-app/src/worklist/WorklistPage.tsx` (header + row cells, plus an expandable detail row spanning all columns).
- Mock cases come from `tmh-app/src/cases/seed.ts`; the `Case` shape is defined in `tmh-app/src/cases/types.ts`.
- The sample DICOM file is confirmed at `C:\Users\THOUGHTCLAN\Downloads\000001.dcm`.
- Weasis registers a custom browser protocol handler (`dicom:`) when installed, so local files are opened via `dicom:get -r file:/<path>` links.

## Design

### 1. Type change — `tmh-app/src/cases/types.ts`

Add an optional field to the `Case` interface:

```ts
scanUrl?: string
```

It stores the raw file path to the DICOM scan, e.g.
`C:\Users\THOUGHTCLAN\Downloads\000001.dcm`. The mock data stores the path
(backslash-separated Windows path, not a URL); the component builds the `dicom:` link.

### 2. Mock data — `tmh-app/src/cases/seed.ts`

Set the following on each of the Radiology cases (c1, c2, c5, c6):

```ts
scanUrl: 'C:\\Users\\THOUGHTCLAN\\Downloads\\000001.dcm'
```

Pathology cases (c3, c4, c7, c8) get no `scanUrl`.

### 3. Worklist table — `tmh-app/src/worklist/WorklistPage.tsx`

- Add a `View Scan` header cell between `Critical` and the expand-chevron column.
- In the row cell:
  - When `c.scanUrl` exists: render
    `<a href={"dicom:get -r file:" + c.scanUrl.replace(/\\/g, "/")} title="Open in Weasis">View Scan</a>`.
    The backslash-to-forward-slash conversion produces a valid
    `file:/C:/Users/THOUGHTCLAN/Downloads/000001.dcm` resource.
  - Otherwise: render an em-dash (`—`) muted in the slate palette.
- The expanded detail row currently spans `colSpan={9}` after an empty first cell
  (10 columns total). Adding one column makes it 11, so bump `colSpan` to `10`.

### 4. Error handling

Best-effort only: if Weasis is not installed or the path is missing, the OS
surfaces its default protocol-handler error. No in-app error UI for this POC.

## Scope

In scope: type, mock data, single table column, expansion colSpan fix.
Out of scope: real DICOM serving, per-case scan links, Weasis config, tests
(none exist in this app).