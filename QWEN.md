# Lango — Project Context

## Project Overview

**Lango** is a desktop application built with **Electron**, **React**, and **TypeScript**. It appears to be a language learning or language-related tool, featuring:

- **i18n support** — internationalization with `i18next` (English and Russian locales)
- **Session management** — tracks learning sessions via `electron-store`
- **Modern UI stack** — React 19, Tailwind CSS v4, Radix UI components, Lucide icons
- **State management** — Zustand for client-side state
- **Routing** — React Router v7
- **Form handling** — React Hook Form with Zod validation

### Architecture

The project follows the standard `electron-vite` three-process structure:

```
src/
├── main/            # Electron main process (window creation, IPC handlers)
├── preload/         # Preload scripts (secure context bridge)
├── renderer/        # React UI (pages, components, stores, router)
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── hooks/        # Custom React hooks
│       ├── layouts/      # Page layouts
│       ├── locales/      # i18n translation files (en, ru)
│       ├── modules/      # Feature modules
│       ├── pages/        # Route pages (Editor, ProjectSelect)
│       ├── providers/    # React context providers
│       ├── router/       # React Router configuration
│       ├── stores/       # Zustand stores
│       └── utils/        # Utilities (including i18n setup)
├── domain/          # Domain models and store configuration
│   ├── models/      # TypeScript types (Session, Language, AppStore, Errors)
│   └── store.ts     # electron-store instance
├── services/        # Business logic services
├── controllers/     # IPC controllers (API layer between main/renderer)
└── test/            # Test setup and utilities
```

## Tech Stack

| Category        | Technology                              |
|-----------------|-----------------------------------------|
| Framework       | Electron 39 + electron-vite 5           |
| UI              | React 19 + TypeScript 5                 |
| Styling         | Tailwind CSS v4 + Radix UI              |
| Icons           | Lucide React                            |
| Font            | Geist (via @fontsource)                 |
| Routing         | React Router v7                         |
| State           | Zustand                                 |
| i18n            | i18next + react-i18next                 |
| Forms           | React Hook Form + Zod v4                |
| Storage         | electron-store                          |
| Updates         | electron-updater                        |
| Testing         | Vitest + Testing Library + jsdom        |
| Linting         | ESLint 9 (flat config)                  |
| Formatting      | Prettier                                |

## Building and Running

### Prerequisites

- Node.js (LTS recommended)
- Yarn package manager

### Commands

```bash
# Install dependencies
yarn

# Start development server (with HMR)
yarn dev

# Type-check all code
yarn typecheck

# Lint code
yarn lint

# Format code
yarn format

# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with UI
yarn test:ui

# Build for production
yarn build

# Build distributable packages
yarn build:win    # Windows
yarn build:mac    # macOS
yarn build:linux  # Linux
```

## Development Conventions

### Code Style

- **Prettier** for formatting (see `.prettierrc.yaml`)
- **ESLint** with TypeScript + React recommended rules
- React Refresh plugin enforces proper component export patterns
- React Hooks rules enforced (exhaustive-deps as warning)

### TypeScript

- Two separate configs: `tsconfig.node.json` (main/preload) and `tsconfig.web.json` (renderer)
- Path alias `@renderer` → `src/renderer/src`
- Strict mode enabled

### Testing

- **Vitest** with v8 coverage provider
- Global test utilities available (`vi`, `expect`, etc.)
- Mock setup in `src/test/setup.ts` for `electron-store` and `electron`
- Test files: `**/*.{test,spec}.{ts,tsx}`
- Excludes: `dist/`, `out/`, `build/`, `node_modules/`

### Project Structure Patterns

- **Domain layer** (`src/domain/`) — types, models, store config
- **Services** (`src/services/`) — pure business logic (testable in isolation)
- **Controllers** (`src/controllers/`) — IPC API layer bridging main ↔ renderer
- **Renderer** (`src/renderer/`) — all UI code (pages, components, hooks, stores)

### Key Files

| File | Purpose |
|------|---------|
| `src/main/index.ts` | Electron main process entry point |
| `src/renderer/src/main.tsx` | React app entry point |
| `src/domain/store.ts` | electron-store configuration |
| `src/domain/models/` | TypeScript type definitions |
| `src/renderer/src/utils/i18n.ts` | i18n initialization |
| `src/renderer/src/router/` | Application routing |
| `electron.vite.config.ts` | Vite build configuration with Tailwind |
