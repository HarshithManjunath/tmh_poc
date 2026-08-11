# Open SVS in QuPath from Worklist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Worklist `View Scan` column so Pathology rows open their `.svs` slide in QuPath via a `qpath://` protocol handler; Radiology rows keep opening DICOM in Weasis.

**Architecture:** Frontend-only React/Vite app. The `Case` type gains an optional `slideUrl` field (raw Windows path). The Worklist cell prioritizes `slideUrl` → `qpath://` link, then `scanUrl` → `weasis://` link, else an em-dash. A one-time `qpath://` protocol handler (a PowerShell launcher + a `.reg` registration) launches `QuPath.exe --image "<path>"`.

**Tech Stack:** React 19, Vite, TypeScript, TailwindCSS, PowerShell (launcher), Windows registry (protocol).

## Global Constraints

- Work is confined to `tmh-app/` (npm commands run with `workdir` = `D:\Work\TMH-POC\tmh-app`).
- No automated test suite (POC). Verification is `npm run build` (runs `tsc -b && vite build`) plus a manual check when possible.
- `slideUrl` stores the raw Windows path `C:\Users\THOUGHTCLAN\Downloads\000001.svs` (backslashes) as the TS literal `'C:\\Users\\THOUGHTCLAN\\Downloads\\000001.svs'`.
- Only Pathology rows (c3, c4, c7, c8) get `slideUrl`; Radiology rows (c1, c2, c5, c6) keep only `scanUrl`.
- `qpathLink(path)` = `'qpath://' + encodeURIComponent(path.replace(/\\/g, '/'))`. The launcher URL-unescapes and converts `/` back to `\`.
- The View Scan cell's priority is: `slideUrl` → `qpath://` anchor (`title="Open in QuPath"`); else `scanUrl` → existing `weasis://` anchor (`title="Open in Weasis"`); else em-dash.
- Column count stays 11; the expanded detail row `<td colSpan={10}>` is unchanged.
- QuPath GUI exe is `%LOCALAPPDATA%\QuPath-*\QuPath-*.exe` (skip the `(console)` variant); fallback search under `C:\Program Files`.
- The `qpath://` registration and launcher are machine/location-specific and live under `tmh-app/qupath-launch/`.

---

### Task 1: Add optional `slideUrl` to the Case type and seed data

**Files:**
- Modify: `tmh-app/src/cases/types.ts`
- Modify: `tmh-app/src/cases/seed.ts`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `Case` gains optional `slideUrl?: string`. Pathology seed rows c3, c4, c7, c8 each carry `slideUrl: 'C:\\Users\\THOUGHTCLAN\\Downloads\\000001.svs'`. Task 2 reads `c.slideUrl`.

- [ ] **Step 1: Add `slideUrl` to the `Case` interface**

Edit `tmh-app/src/cases/types.ts`. Add the optional field after `scanUrl` (currently the last property, which is `scanUrl?: string`):

```ts
  aiFindingCount: number | null
  scanUrl?: string
  slideUrl?: string
}
```

- [ ] **Step 2: Add `slideUrl` to the four Pathology seed rows**

Edit `tmh-app/src/cases/seed.ts`. The four Pathology rows and the current last line of each object are:

- c3 (ends with `aiFindingCount: null,`) — append after it:
```ts
    slideUrl: 'C:\\Users\\THOUGHTCLAN\\Downloads\\000001.svs',
```
- c4 (ends with `aiFindingCount: 1,`) — same line after it.
- c7 (ends with `aiFindingCount: 4,`) — same line after it.
- c8 (ends with `aiFindingCount: null,`) — same line after it.

Radiology rows (c1, c2, c5, c6) are left untouched (they already have `scanUrl`).

- [ ] **Step 3: Verify the type check passes**

Run (from `D:\Work\TMH-POC\tmh-app`):
```powershell
npm run build
```
Expected: exit code 0, `tsc -b` reports no errors, `vite build` prints a success line (e.g. `✓ built in ...`).

- [ ] **Step 4: Commit**

```bash
git add tmh-app/src/cases/types.ts tmh-app/src/cases/seed.ts
git commit -m "feat: add optional slideUrl to case mock data"
```

---

### Task 2: Open SVS in QuPath from the View Scan column

**Files:**
- Modify: `tmh-app/src/worklist/WorklistPage.tsx`

**Interfaces:**
- Consumes: `Case.slideUrl?: string` from Task 1, and the existing `weasisLink` helper.
- Produces: a `qpathLink(path: string): string` helper; the View Scan cell now opens QuPath when `slideUrl` is present, else Weasis when `scanUrl` is present, else an em-dash.

- [ ] **Step 1: Add the `qpathLink` helper**

Edit `tmh-app/src/worklist/WorklistPage.tsx`. Directly after the existing `weasisLink` function (currently ends at line 59, before `const DEPTS`), insert:

```ts
function qpathLink(path: string): string {
  return 'qpath://' + encodeURIComponent(path.replace(/\\/g, '/'))
}
```

- [ ] **Step 2: Generalize the View Scan row cell**

In `RowGroup`, replace the current View Scan `<td>` (currently lines 407-419, the `{c.scanUrl ? (...) : (<span ...>—</span>)}` block) with:

```tsx
      <td className="px-3 py-3">
        {c.slideUrl ? (
          <a
            href={qpathLink(c.slideUrl)}
            title="Open in QuPath"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            View Scan
          </a>
        ) : c.scanUrl ? (
          <a
            href={weasisLink(c.scanUrl)}
            title="Open in Weasis"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            View Scan
          </a>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
```

Do not change the header cell, the column count, or the expanded row `colSpan`.

- [ ] **Step 3: Verify the type check and build pass**

Run (from `D:\Work\TMH-POC\tmh-app`):
```powershell
npm run build
```
Expected: exit code 0, no `tsc` errors, `vite build` succeeds.

- [ ] **Step 4: Commit**

```bash
git add tmh-app/src/worklist/WorklistPage.tsx
git commit -m "feat: open SVS slides in QuPath from view scan column"
```

---

### Task 3: Add the `qpath://` launcher and registration files

**Files:**
- Create: `tmh-app/qupath-launch/qpath-launcher.ps1`
- Create: `tmh-app/qupath-launch/register-qpath.reg`
- Create: `tmh-app/qupath-launch/README.md`

**Interfaces:**
- Consumes: the `qpath://<encoded-path>` URL format emitted by `qpathLink` in Task 2.
- Produces: a Windows protocol handler `qpath://` that launches `QuPath.exe --image "<decoded path>"`. The registration references `qpath-launcher.ps1` by absolute path.

- [ ] **Step 1: Create the PowerShell launcher**

Create `tmh-app/qupath-launch/qpath-launcher.ps1`:

```powershell
param([string]$Url)

$scheme = 'qpath://'
$path = $Url
if ($path.StartsWith($scheme, [System.StringComparison]::OrdinalIgnoreCase)) {
  $path = $path.Substring($scheme.Length)
}
$path = [System.Uri]::UnescapeDataString($path)
$path = $path.Replace('/', '\')

$exe = $null
foreach ($base in @((Join-Path $env:LOCALAPPDATA 'QuPath-*\QuPath-*.exe'),
                   'C:\Program Files\QuPath-*\QuPath-*.exe')) {
  $found = Get-ChildItem $base -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -notmatch 'console' } |
    Select-Object -First 1 -ExpandProperty FullName
  if ($found) { $exe = $found; break }
}

if (-not $exe) {
  Write-Error 'QuPath executable not found.'
  exit 1
}

Start-Process -FilePath $exe -ArgumentList "--image `"$path`""
```

- [ ] **Step 2: Create the registration file**

Create `tmh-app/qupath-launch/register-qpath.reg` (the command path below uses the current repo absolute location; it is machine-specific by design for this POC):

```
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\qpath]
@="URL:QuPath Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\qpath\shell\open\command]
@="\"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe\" -ExecutionPolicy Bypass -NoProfile -File \"D:\\Work\\TMH-POC\\tmh-app\\qupath-launch\\qpath-launcher.ps1\" \"%1\""
```

- [ ] **Step 3: Create the setup note**

Create `tmh-app/qupath-launch/README.md`:

```markdown
# QuPath launch helper (POC)

Opens a local `.svs` slide in QuPath from a `qpath://...` link in the web app.

## One-time setup

1. Ensure QuPath 0.7+ is installed.
2. Double-click `register-qpath.reg` (confirm the registry prompt; may require
   administrator rights) to register the `qpath://` handler.

## How it works

- The web app emits `qpath://<url-encoded path>`.
- Windows hands the URL to `qpath-launcher.ps1`.
- The script URL-decodes the path, converts `/` back to `\`, locates
  `QuPath-*.exe`, and runs `QuPath.exe --image "<path>"`.

## Troubleshooting

- If clicking the link does nothing or shows a handler error: re-run
  `register-qpath.reg`, and confirm `C:\Users\THOUGHTCLAN\AppData\Local\QuPath-0.7.0\QuPath-0.7.0.exe` exists.
- The launcher searches `%LOCALAPPDATA%\QuPath-*\QuPath-*.exe` and
  `C:\Program Files\QuPath-*\QuPath-*.exe` (skipping the `(console)` variant).
```

- [ ] **Step 4: Verify the launcher parses a test URL**

Run:
```powershell
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "D:\Work\TMH-POC\tmh-app\qupath-launch\qpath-launcher.ps1" "qpath://C%3A%2FUsers%2FTHOUGHTCLAN%2FDownloads%2F000001.svs"
```
Expected: no error output; QuPath launches and opens `C:\Users\THOUGHTCLAN\Downloads\000001.svs`. If the `qpath://` handler is not yet registered, this direct PowerShell invocation still validates the decoding/launch path. (Note: you may need to close any already-running QuPath session for the new image to open.)

- [ ] **Step 5: Register the protocol handler and verify end-to-end**

Run:
```powershell
regedit /s "D:\Work\TMH-POC\tmh-app\qupath-launch\register-qpath.reg"
```
(Add `Start-Process regedit -ArgumentList '/s','...'` if elevation is needed.) Then confirm the handler with:
```powershell
Get-Item 'Registry::HKEY_CLASSES_ROOT\qpath\shell\open\command' | Select-Object -ExpandProperty '(default)'
```
Expected: the powershell command string shown above. Finally, in the running app (`npm run dev`, worklist page), click `View Scan` on a Pathology row (e.g. Rajesh Kumar). Expected: the browser prompts to open `qpath://`, and accepting launches QuPath with `000001.svs`.

- [ ] **Step 6: Commit**

```bash
git add tmh-app/qupath-launch/qpath-launcher.ps1 tmh-app/qupath-launch/register-qpath.reg tmh-app/qupath-launch/README.md
git commit -m "feat: add qpath protocol launcher and registration"
```
