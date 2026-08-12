# Application Sidebar Collapse Design

## Scope

Add a collapsible application shell sidebar based on the supplied sidebar reference image. The change applies to `src/shell/Sidebar.tsx` and the existing shell user area. The preview form-navigation sidebars are out of scope.

## Sidebar Behavior

- The sidebar owns a boolean collapsed state.
- The initial state is read from a dedicated `localStorage` key.
- The default is expanded when the key is absent, invalid, or storage cannot be read.
- Clicking the right-edge collapse control toggles the state and persists it immediately.
- Expanded mode retains the current `w-60` layout footprint.
- Collapsed mode uses a narrow icon rail. Navigation icons remain visible, while the brand and navigation labels are hidden.
- Active and hover states remain available in both modes.
- The sidebar width transitions without changing the rest of the shell structure.
- The edge control visually follows the supplied reference: a circular light control overlapping the sidebar border, with its icon indicating the action.
- The control has an accessible label and tooltip/title.

## User Area

### Expanded Mode

- Keep the existing user name and email display.
- Keep the full-width `Logout` button and its existing functionality.
- Add the lucide `LogOut` icon next to the `Logout` text.

### Collapsed Mode

- Replace the full user block with a user icon and a separate settings icon.
- The settings icon is visual-only and has no action yet.
- Hovering or keyboard-focusing the user icon opens a compact panel containing only the user name and email.
- The panel stays usable while the pointer moves from the user icon into the panel and does not change sidebar width.
- Logout remains a separate control containing only the lucide `LogOut` icon and retains the existing logout behavior.
- Icon-only controls have accessible labels and tooltips.

## Data Flow and Boundaries

`Sidebar` is the single owner of the collapse state and passes `collapsed` to `UserInfo`. Navigation links, active route behavior, authentication, and logout remain unchanged. No context is introduced because no other shell component currently needs this state.

## Error Handling

No dedicated error UI is required. Invalid or unavailable persisted storage falls back to expanded mode, and the sidebar remains usable. The settings control must not imply functionality until settings behavior is implemented.

## Verification

- Run the project TypeScript/build validation.
- Verify navigation and logout behavior remain unchanged.
- Verify expanded and collapsed visual states against the supplied reference.
- Verify the state survives navigation and a page reload.
- Verify keyboard focus behavior for collapse, user, settings, and logout controls.
- Verify the icon rail and main content remain usable at narrow viewport widths.
