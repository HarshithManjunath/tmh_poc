# View Scan Column with Weasis Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `View Scan` column to the Worklist table; Radiology rows link to a local DICOM file that opens in the installed Weasis desktop viewer.

**Architecture:** Frontend-only React/Vite app. The `Case` type gains an optional `scanUrl` field holding a raw Windows file path; the Worklist table builds a `weasis://?<url-encoded-command>` protocol link from it and renders it as an anchor for Radiology rows (em-dash for others).

**Tech Stack:** React 19, Vite, TypeScript, TailwindCSS, react-router-dom.

## Global Constraints

- Work is confined to `tmh-app/` (run npm commands with `workdir` = `D:\Work\TMH-POC\tmh-app`).
- No automated test suite (POC). Verification is `npm run build` (runs `tsc -b && vite build`) plus a manual browser check.
- `scanUrl` stores the raw Windows path `C:\Users\THOUGHTCLAN\Downloads\000001.dcm` (backslashes) — the component converts backslashes to forward slashes and URL-encodes the command.
- Weasis protocol link format (verified against official docs): `weasis://?` + `encodeURIComponent('$dicom:get -l "<path with forward slashes>"')`.
- Only Radiology seed rows (c1, c2, c5, c6) get `scanUrl`; Pathology rows (c3, c4, c7, c8) get none and display an em-dash.
- Table currently has 10 columns; the expandable detail row uses an empty `<td />` + `<td colSpan={9}>`. Adding `View Scan` makes 11 columns, so `colSpan` becomes `10`.

---

### Task 1: Add optional `scanUrl` to the Case type and seed data

**Files:**
- Modify: `tmh-app/src/cases/types.ts`
- Modify: `tmh-app/src/cases/seed.ts`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `Case` gains optional `scanUrl?: string`. Radiology seed rows c1, c2, c5, c6 each carry `scanUrl: 'C:\\Users\\THOUGHTCLAN\\Downloads\\000001.dcm'`. Task 2 reads `c.scanUrl`.

- [ ] **Step 1: Add `scanUrl` to the `Case` interface**

Edit `tmh-app/src/cases/types.ts`. Add the optional field as the last property of the interface (after `aiFindingCount`):

```ts
  isEmergency: boolean
  isCritical: boolean
  aiFindingCount: number | null
  scanUrl?: string
}
```

- [ ] **Step 2: Add `scanUrl` to the four Radiology seed rows**

Edit `tmh-app/src/cases/seed.ts`. In each Radiology case object, add the line right after its `aiFindingCount` line. The four Radiology cases and their existing final lines are:

- c1 (line 27 `aiFindingCount: 3,`) — add after it:
```ts
    scanUrl: 'C:\\Users\\THOUGHTCLAN\\Downloads\\000001.dcm',
```
- c2 (line 52 `aiFindingCount: 5,`) — same line after it.
- c5 (line 127 `aiFindingCount: 2,`) — same line after it.
- c6 (line 152 `aiFindingCount: 7,`) — same line after it.

The Pathology rows (c3, c4, c7, c8) are left untouched.

- [ ] **Step 3: Verify the type check passes**

Run (from `D:\Work\TMH-POC\tmh-app`):
```powershell
npm run build
```
Expected: `tsc -b && vite build` completes with exit code 0 and a `vite build` success line (e.g. `✓ built in ...`).

- [ ] **Step 4: Commit**

```bash
git add tmh-app/src/cases/types.ts tmh-app/src/cases/seed.ts
git commit -m "feat: add optional scanUrl to case mock data"
```

---

### Task 2: Add View Scan column to the worklist table

**Files:**
- Modify: `tmh-app/src/worklist/WorklistPage.tsx`

**Interfaces:**
- Consumes: `Case.scanUrl?: string` from Task 1 (raw Windows path).
- Produces: a `View Scan` column in the worklist table; rows with `scanUrl` render a `weasis://?` anchor, rows without render an em-dash. Expanded detail row now spans 11 columns.

- [ ] **Step 1: Add a link builder helper**

Edit `tmh-app/src/worklist/WorklistPage.tsx`. Add this top-level function after `statusTone` (around line 55), before the `DEPTS` constant:

```ts
function weasisLink(path: string): string {
  const command = `$dicom:get -l "${path.replace(/\\/g, '/')}"`
  return 'weasis://?' + encodeURIComponent(command)
}
```

- [ ] **Step 2: Add the `View Scan` header cell**

In the `<thead>` block, after the `Critical` header `<th>` (line 297) and before the empty `<th className="w-10 px-3 py-3" />` (line 298), insert:

```tsx
                <th className="px-3 py-3 font-medium">View Scan</th>
```

- [ ] **Step 3: Add the `View Scan` row cell**

In `RowGroup`, the first row `<tr>` renders a Critical cell ending at line 401 (`)}`), followed by the expand-chevron `<td>` at line 402. Insert this cell between them:

```tsx
      <td className="px-3 py-3">
        {c.scanUrl ? (
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

- [ ] **Step 4: Fix the expanded detail row colSpan**

In the expanded `<tr>` (line 418-428), change the detail cell from `colSpan={9}` to `colSpan={10}`:

```tsx
          <td colSpan={10} className="px-4 py-4">
```

- [ ] **Step 5: Verify the type check and build pass**

Run (from `D:\Work\TMH-POC\tmh-app`):
```powershell
npm run build
```
Expected: exit code 0, `tsc -b` reports no errors, `vite build` succeeds.

- [ ] **Step 6: Manual browser verification**

Run (from `D:\Work\TMH-POC\tmh-app`):
```powershell
npm run dev
```
Open the app at the Worklist route (e.g. `http://localhost:5173/worklist`). Expected:
- A `View Scan` column header appears between `Critical` and the expand chevron.
- The four Radiology rows (Anil Sharma, Meera Iyer, Aman Gupta, Priya Nair) show a blue `View Scan` link.
- The four Pathology rows (Rajesh Kumar, Sunita Verma, Vikram Singh, Kavita Reddy) show a muted em-dash `—`.
- Clicking a `View Scan` link prompts the browser to open the `weasis://` handler; accepting launches Weasis showing the 000001.dcm image. Clicking the expand chevron on any row shows the detail row still aligned across all 11 columns.

- [ ] **Step 7: Commit**

```bash
git add tmh-app/src/worklist/WorklistPage.tsx
git commit -m "feat: add view scan column with Weasis launch"
```
