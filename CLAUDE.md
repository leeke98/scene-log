# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scene Log is a React + TypeScript frontend for managing theater/musical performance attendance records. It connects to a Node.js/MySQL backend (separate repo) deployed on Render.

## Commands

```bash
npm run dev       # Start dev server (proxies /api → backend)
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test runner is configured.

## Architecture

### Data Flow
```
Page → React Query hook (queries/) → service function (services/) → apiClient (lib/apiClient.ts) → backend API
```

State has two layers:
- **Server state**: TanStack Query manages caching, refetching, and mutations
- **Client state**: Zustand (`stores/authStore.ts`) for auth persistence to localStorage

### Key Directories

- **`src/services/`** — Raw API calls (`authApi.ts`, `ticketApi.ts`, `reportApi.ts`, `kopisApi.ts`)
- **`src/queries/`** — TanStack Query hooks wrapping services; organized into `auth/`, `tickets/`, `reports/`, `kopis/`, each with `queries.ts` + `mutations.ts`
- **`src/stores/`** — Zustand stores (currently only `authStore.ts`)
- **`src/lib/apiClient.ts`** — Central HTTP client; handles JWT Bearer token (stored in localStorage), automatic redirect on 401, and dev-mode request logging
- **`src/pages/`** — Route-level components
- **`src/components/`** — Feature components grouped by domain (`report/`, `explore/`, `charts/`, `ui/`)
- **`src/types/`** — Shared TypeScript interfaces

### Routing & Auth

`App.tsx` defines all routes. `PrivateRoute` redirects unauthenticated users to `/login`; `PublicRoute` redirects authenticated users away from `/login` and `/signup`. Auth state is checked via Zustand + TanStack Query's `useCurrentUser`.

### Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL (defaults to `/api` proxy in dev) |
| `VITE_KOPIS_SERVICE_KEY` | API key for KOPIS (Korea Performance Information System) |

### UI Stack

- **Tailwind CSS** with CSS variables and class-based dark mode
- **Radix UI** primitives wrapped in `src/components/ui/` (Shadcn/UI pattern)
- **Recharts** for data visualization
- **@dnd-kit** for drag-and-drop
- **lucide-react** for icons

### TypeScript

Strict mode is on with `noUnusedLocals` and `noUnusedParameters` enforced. Path alias `@/` maps to `src/`. ESLint uses flat config (eslint.config.js) targeting `.ts`/`.tsx` files.
