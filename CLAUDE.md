# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Electron app with hot reload
npm run build        # Typecheck + build (all platforms)
npm run typecheck    # Run both node and web typechecks
npm run lint         # ESLint with cache
npm run format       # Prettier format
npm run test         # Run tests once (Vitest)
npm run test:watch   # Vitest watch mode
```

Tests live in `src/services/*.test.ts`. There is no per-file test runner flag — filter by name with `npx vitest run --reporter=verbose -t "test name"`.

## Architecture

**Lango** is an Electron desktop app for managing i18n/localization projects. The core concept: a "session" is a pointer to a folder on disk whose first-level subdirectories are locale codes (`en/`, `ru/`, etc.), each containing the same `.json` key files.

### Process split

| Layer    | Path                 | Role                                                                                                                                   |
| -------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Main     | `src/main/`          | Window creation, imports `src/controllers/` to register all IPC handlers                                                               |
| Preload  | `src/preload/`       | `contextBridge` bridge — exposes `window.api`, `window.electron`, `window.currentSession`, `window.sessions`, `window.currentLanguage` |
| Renderer | `src/renderer/src/`  | React SPA, communicates only via `window.api`                                                                                          |
| Shared   | `src/domain/models/` | TypeScript types shared between all processes (included in both tsconfigs)                                                             |

### IPC pattern

Every feature follows the same pattern:

1. **`src/controllers/fooController.ts`** — registers `ipcMain.handle('foo:bar', ...)` handlers, exports a `FooHandler` type derived from a stub object via `GenericControllerHandler<T>` (in `types.ts`) which auto-wraps returns in `Promise`
2. **`src/controllers/api.ts`** — renderer-side mirror: `ipcRenderer.invoke('foo:bar', ...)` calls, grouped by domain
3. **`src/controllers/types.ts`** — `ControllerHandler` aggregates all handler types; used in `preload/index.d.ts` to type `window.api`

When adding a new IPC call: add handler in the controller, add the invoke in `api.ts`, update the stub in the same controller file.

### Services (main process)

`src/services/` holds business logic called from controllers:

- **`sessionService.ts`** — singleton, persists sessions via `electron-store` (`src/domain/store.ts`)
- **`projectService.ts`** — scans locale folders, builds the unified file tree (`FileTreeData`), detects orphan files (files absent from ≥1 locale)
- **`fileWatcher.ts`** — `fs.watch` on the project path; broadcasts `file-tree:changed` IPC event to all windows on `.json` changes (debounced 300ms)

### File tree data model

The tree is **unified** — files appear once regardless of how many locales exist:

```typescript
FileTreeData = {
  root: FileTreeGroup   // project name at top
  locales: string[]     // all locale folder names
}

FileTreeGroup = { name, nestedItems: (FileTreeGroup | FileTreeItem)[], isOrphan? }
FileTreeItem  = { name, link, locales: string[], isOrphan? }
// isOrphan = file exists in some but not all locales
// link = "/folder/subfolder/filename" (no locale prefix, no .json)
```

### Renderer stores (Zustand)

- **`fileTreeStore`** — fetches `FileTreeData` from main, counts total/orphan files; re-fetches on `file-tree:changed` IPC event
- **`sessionStore`** — mirrors `currentSession` / `sessions`; initialized from `window.currentSession` / `window.sessions` at startup
- **`visibilityStore`** — panel open/close state + DOM refs (`projectTreeRef` used for keyboard navigation in `projectTree.tsx`)
- **`localizationStore`** — locale folder list from main

### Renderer routing

`createHashRouter` with two routes: `/` (project select) and `/editor` (editor with file tree sidebar). File-level navigation within the editor is not yet implemented — `link` fields in `FileTreeItem` are prepared but no nested routes exist yet.

### Path aliases

`@renderer/*` → `src/renderer/src/*` (configured in both `electron.vite.config.ts` and `tsconfig.web.json`).

`src/domain/models/*` is accessible from all processes via direct relative imports — no alias needed.
