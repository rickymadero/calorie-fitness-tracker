# Evolve · Mobile Preview in Cursor

## One-click (recommended)

1. Press **⌘⇧B** (Mac) / **Ctrl+Shift+B** (Windows) — default build task  
   **or** Command Palette → `Tasks: Run Task` → **Evolve: Mobile Preview**
2. Cursor starts `npm run dev` (if needed) and opens **Simple Browser** at  
   `http://127.0.0.1:3000/dev/preview`
3. You get an **iPhone 15** frame (390×844). Edit a file → save → **HMR** updates the app inside the phone (no full refresh).

## Open manually

- Command Palette → **Simple Browser: Show**  
  → paste `http://127.0.0.1:3000/dev/preview`

## Device sizes

Inside `/dev/preview` use the **Device** dropdown:

| Device | Size |
|--------|------|
| iPhone 15 (default) | 390×844 |
| iPhone SE | 375×667 |
| iPhone 15 Pro Max | 430×932 |
| Pixel 7 | 412×915 |

Use **Path** (e.g. `/feed`, `/login`) + Enter or **Reload frame** to jump routes.

## Split view

1. Open a code file  
2. Drag the **Simple Browser** tab to the right (or below)  
3. Code left / phone right — mobile-first without leaving Cursor

## Why not Chrome Device Toolbar?

Cursor’s **Simple Browser** has no DevTools device mode.  
`/dev/preview` is our phone chrome + iframe so size stays locked at iPhone 15 while Next.js Fast Refresh still runs in the frame.

## Full-width preview

Task **Evolve: Show Full Browser** → `http://127.0.0.1:3000` (no phone bezel).

## Requirements

- Dev server: `npm run dev` → port **3000** (`127.0.0.1`)  
- **Evolve: Mobile Preview** reuses an existing listener on `:3000` (does not start a second `next dev`)
- Auto-save is enabled in workspace settings (~800ms) so HMR fires as you type/pause
