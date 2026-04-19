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

## Feature-Based Architecture

After recent refactoring:

```
src/renderer/src/
├── components/
│   ├── ui/        # Primitive UI (shadcn-like): button, dialog, dropdown, etc.
│   ├── form/       # Form components: inputs/, form.tsx
│   └── project/    # Domain components: Logo, FileTree, LocaleIcon
├── features/      # Feature modules (was: modules/)
│   ├── projectSelect/   # Project selection page
│   ├── editor/          # Main editor with tree, search, localizations
│   ├── detail/          # Per-file translation editor
│   └── localeEditor/     # All-locales view
├── stores/        # State management
│   └── providers/ # ProjectsProvider
├── layouts/      # Route layouts
├── router/        # Hash router config
└── pages/        # Entry pages → features/*/index.ts
```

### Import Conventions

- UI primitives: `@renderer/components/ui/button`
- Forms: `@renderer/components/form` or `@renderer/components/form/inputs/PathInput`
- Project components: `@renderer/components/project/FileTree`
- Features: `@renderer/features/editor/components/EditorHeader`
- Stores: `@renderer/stores/sessionStore`
- Providers: `@renderer/stores/providers/ProjectsProvider`

### Adding New Features

1. Create `features/<feature>/components/` for feature-specific components
2. Create `features/<feature>/index.tsx` as page export (with default export)
3. Add route in `router/index.ts` using the feature index
4. Add barrel export in feature's `index.tsx` for re-exports
