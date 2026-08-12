# Sidebar Collapse Button Visibility Design

## Scope

Refine only the existing application-shell sidebar collapse button in `tmh-app/src/shell/Sidebar.tsx`. Do not change its toggle behavior, labels, icons, persistence, or position relative to the sidebar edge.

## Visual Change

- Increase the button from `h-6 w-6` to `h-8 w-8` to improve the click target and visibility.
- Change the right offset from `-right-3` to `-right-4` so the larger button remains centered over the sidebar edge.
- Increase the shadow from `shadow-sm` to `shadow-lg` so the white button remains visible over the white main area.
- Preserve the existing border, colors, hover state, focus-visible ring, z-index, and top placement.

## Verification

- Run `npm run build` from `tmh-app`.
- Confirm the diff is limited to the collapse-button classes in `Sidebar.tsx`.
