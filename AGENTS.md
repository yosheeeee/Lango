# AGENTS.md

## Key Commands

```bash
npm run dev          # Electron with hot reload
npm run build       # Typecheck + build all platforms
npm run test       # Vitest (no per-file flag — use -t to filter)
npm run typecheck  # Both node + web checks
```

**Run a single test**: `npx vitest run -t "test name"` — there is no per-file flag.

## Architecture

- **Electron app** with main/preload/renderer split
- **React SPA** in renderer, talks to main via IPC only (`window.api`)
- **Hash router** (`createHashRouter` at `/` and `/editor`)
- Path alias: `@renderer/*` → `src/renderer/src/`

## IPC Pattern

Every feature follows: controller → api → types. See `src/controllers/` for the pattern. Handler returns are auto-wrapped in Promise.

## Testing

Tests live in `src/services/*.test.ts`.

## File Tree Model

Unified tree — files appear once, `isOrphan` marks files missing from ≥1 locale. Link paths omit locale prefix and `.json`.