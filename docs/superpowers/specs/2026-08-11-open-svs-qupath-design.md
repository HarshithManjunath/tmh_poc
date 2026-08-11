# Open SVS in QuPath from Worklist — Design

Date: 2026-08-11

## Goal

Add QuPath launch for whole-slide images (`.svs`) to the Worklist's existing
`View Scan` column. Pathology rows open `C:\Users\THOUGHTCLAN\Downloads\000001.svs`
in the installed QuPath desktop app; Radiology rows keep opening DICOM in Weasis.

## Context

- The Worklist table (`tmh-app/src/worklist/WorklistPage.tsx`) already has a
  `View Scan` column: Radiology rows render a `weasis://?` anchor (from
  `Case.scanUrl`, a raw `.dcm` path), Pathology rows render an em-dash.
- `Case` (defined in `tmh-app/src/cases/types.ts`) currently has optional
  `scanUrl?: string`.
- Sample slide confirmed at `C:\Users\THOUGHTCLAN\Downloads\000001.svs`.
- QuPath 0.7.0 is installed at
  `C:\Users\THOUGHTCLAN\AppData\Local\QuPath-0.7.0\QuPath-0.7.0.exe`
  (GUI exe; a `(console)` variant also exists).
- QuPath ships NO browser protocol handler (unlike Weasis), so a custom
  `qpath://` protocol handler must be registered. QuPath opens a slide via
  `QuPath.exe --image "<path>"`.

## Design

### 1. Type change — `tmh-app/src/cases/types.ts`

Add a parallel optional field to the `Case` interface (after `scanUrl`):

```ts
slideUrl?: string
```

It stores the raw Windows path to the whole-slide image, e.g.
`C:\Users\THOUGHTCLAN\Downloads\000001.svs`.

### 2. Mock data — `tmh-app/src/cases/seed.ts`

Add to each of the 4 Pathology rows (c3, c4, c7, c8):

```ts
slideUrl: 'C:\\Users\\THOUGHTCLAN\\Downloads\\000001.svs'
```

Radiology rows (c1, c2, c5, c6) are unchanged (they keep `scanUrl` only).

### 3. Worklist table — `tmh-app/src/worklist/WorklistPage.tsx`

- Add a link-builder helper beside `weasisLink`:
  ```ts
  function qpathLink(path: string): string {
    return 'qpath://' + encodeURIComponent(path.replace(/\\/g, '/'))
  }
  ```
- Generalize the existing `View Scan` row cell (priority order):
  1. `c.slideUrl` → `<a href={qpathLink(c.slideUrl)} title="Open in QuPath">View Scan</a>`
  2. else `c.scanUrl` → existing Weasis anchor (`title="Open in Weasis"`)
  3. else → muted em-dash `—`
- Column count stays 11; the expanded detail row `colSpan={10}` is unchanged.

### 4. One-time launch helpers (new repo files)

- `tmh-app/qupath-launch/qpath-launcher.ps1`
  - Takes the `qpath://` URL as its sole argument.
  - Strips the `qpath://` prefix, URL-unescapes the remainder, converts `/` to `\`.
  - Locates the GUI `QuPath-*.exe` under `%LOCALAPPDATA%\QuPath-*` (skipping
    the `(console)` variant); falls back to searching `C:\Program Files`.
  - Runs `Start-Process <qupath.exe> --image "<path>"`.
- `tmh-app/qupath-launch/register-qpath.reg`
  - Registers `qpath://` (`URL Protocol`) whose `shell\open\command` invokes
    `powershell.exe -ExecutionPolicy Bypass -NoProfile -File ...\qpath-launcher.ps1 "%1"`,
    using this machine's absolute launcher path.

### 5. One-time setup (documented; user action)

- QuPath 0.7.0 already installed.
- Run `register-qpath.reg` (may require admin) to register the `qpath://` handler.

### 6. Error handling

Best-effort only: if QuPath is not installed or `qpath://` is not registered,
the OS surfaces its default protocol-handler error. No in-app error UI.

## Scope

In scope: type field, seed data, generalized Worklist cell, launcher `.ps1`,
`.reg` registration file, and a short setup note. Out of scope: remote slide
serving, per-case distinct slides, QuPath config, automated tests (the app has
none).