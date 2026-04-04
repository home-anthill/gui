# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**gui** is the React-based web frontend for the home-anthill IoT platform. It provides a dark-themed dashboard for managing homes, rooms, devices, and sensor features. Built with React 19, Material UI 7, Redux Toolkit (RTK Query), and React Router 7. Uses Nx as the monorepo/build tool and Vite as the bundler.

## Build & Development Commands

```bash
npm install         # Install dependencies
npm run start       # Lint + start dev server (Vite on :4200 with /api proxy)
npm run build       # Lint + dev build → dist/home-anthill/, then copies to ../api-server/public/
npm run build:prod  # Production build → dist/home-anthill/ only (no copy step)
npm run lint        # Run ESLint (flat config via nx lint)
npm run deps        # Upgrade Nx to latest
```

**Dev server**: Runs on `http://localhost:4200`. The `proxy.config.json` forwards `/api/*` to `http://localhost:8082` (api-server). The dev proxy requires the backend to be running locally.

**Build output**: Both `npm run build` and `npm run build:prod` output to `dist/home-anthill/`. The `build` command then copies this to `../api-server/public/` for serving as static assets; `build:prod` skips the copy.

**No tests currently exist** — vitest is installed but there are no test files.

## Architecture

### Directory Structure

```
src/
├── app/              # Pages/views (login, postlogin, profile, homes, edithome, devices, devicesettings, features)
├── auth/             # AuthContext, AuthLayout, ProtectedLayout, auth-utils (localStorage JWT)
├── hooks/            # Custom hooks wrapping RTK Query (useHomes, useDevices, useRooms, useAuth, etc.)
├── models/           # TypeScript interfaces (Home, Device, Profile, Auth, Value, Online)
├── services/         # RTK Query endpoint definitions (homes, devices, rooms, values, profile, online)
├── shared/           # Shared UI components (navbar)
└── store.ts          # Redux store + RTK Query setup
```

### State Management / API Pattern

All API calls use **RTK Query** via a single base API (`src/services/common.ts` → `commonApi`) with `injectEndpoints`. Each domain (`homes`, `devices`, `rooms`, `values`, `profile`, `online`) extends it in its own `services/*.ts` file.

**Key RTK Query details:**
- Base query (`src/services/common.ts`) sets up the `/api` baseUrl, adds the JWT `Authorization: Bearer <token>` header, and implements automatic token refresh on 401
- On **401**: calls `POST /api/token/refresh` (browser sends the `refresh_token` HttpOnly cookie automatically), stores the new access token from the JSON response `{ token }`, then retries the original request. Concurrent 401s share a single in-flight refresh via a serialised promise.
- On **403** or refresh failure: removes the access token from `localStorage` and redirects to `/`
- Cache TTL is 60 seconds (`keepUnusedDataFor: 60`)
- Tag-based cache invalidation: when mutations succeed, they invalidate specific tags (e.g., `invalidatesTags: ['Devices']`) to refetch related data
- `transformResponse` hooks allow reshaping API responses (e.g., in `devices.ts` to organize devices by home and room)

**Adding a new API endpoint:**
1. Create or extend a `services/*.ts` file with `commonApi.injectEndpoints()`
2. Define a query or mutation with `builder.query()` or `builder.mutation()`
3. Export the auto-generated hook (e.g., `useGetHomesQuery`)
4. Optionally wrap it in a custom hook in `src/hooks/` for a cleaner page component interface

**Custom hooks in `src/hooks/`** combine multiple RTK Query hooks and provide a domain-specific interface (e.g., `useHomes` exposes `homes`, `addHome`, `deleteHome`, `updateHome`).

### Auth Flow

1. GitHub OAuth2 → redirect to `/postlogin` with access token in **URL fragment** (`#token=<jwt>`) → parsed via `new URLSearchParams(location.hash.slice(1)).get('token')` → stored in `localStorage` via `auth-utils.tsx`. The `refresh_token` HttpOnly cookie is set by the server at the same time and managed automatically by the browser.
2. `AuthProvider` (wraps entire app via `AuthLayout`) provides `login`/`logout`/`isLogged` via `AuthContext`
3. `ProtectedLayout` wraps authenticated routes — redirects to `/login` if `localStorage` has no token
4. When the access token expires the RTK Query base query transparently calls `POST /api/token/refresh`, stores the new token, and retries — no user interaction required. If refresh also fails the user is logged out.

### Route Hierarchy

```
AuthLayout (AuthProvider)
├── /  →  Login
├── /login  →  Login
├── /postlogin  →  PostLogin
├── /profile  →  ProtectedLayout → Profile
└── /main  →  ProtectedLayout → Main (navbar shell)
    ├── /devices  →  Devices
    ├── /devices/:id  →  DeviceSettings
    ├── /devices/:id/features  →  Features
    ├── /homes  →  Homes
    └── /homes/:id/edit  →  EditHome
```

## Tech Stack & Code Style

- React 19, React Router 7, Redux Toolkit 2 (RTK Query)
- Material UI 7 + Emotion (dark theme only)
- React Hook Form 7
- Vite (via Nx 22), ESLint 9 (flat config), TypeScript 5.9
- **TypeScript strict mode enabled** — all code must be type-safe
- **Code formatting**: Prettier (single quotes) via ESLint; run `npm run lint` before committing


## Common Development Patterns

**Adding a new page:**
1. Create a new TSX file in `src/app/<pagename>/<pagename>.tsx`
2. Add a route to `src/app/app.tsx` (wrap with `ProtectedLayout` if authenticated)
3. Create a custom hook in `src/hooks/` if the page needs data from multiple API endpoints
4. Import Material UI components and use the dark theme (no light theme styling)

**Adding a new API domain:**
1. Create a new TypeScript interface in `src/models/` for the data type
2. Create `src/services/<domain>.ts` using `commonApi.injectEndpoints()`
3. Define queries and mutations with appropriate tag-based cache invalidation
4. Export the auto-generated hooks
5. Optionally wrap in a custom hook in `src/hooks/` for page-level access

**Cache invalidation strategy:**
- Tag types are defined in `commonApi` in `src/services/common.ts`
- When a mutation succeeds, specify `invalidatesTags` to refetch related queries
- Use fine-grained tags (e.g., `{ type: 'Homes', id: 'LIST' }`) for partial invalidation if needed
- Per-item tagging is used in `devices.ts` and `values.ts`; `online.ts` uses per-device `{ type: 'Online', id }` tags

**Material UI dark theme:**
- Theme is configured in `src/app/app.tsx` with `createTheme({ palette: { mode: 'dark' } })`
- All pages inherit this theme; no light theme support

## CI/CD

GitHub Actions (`.github/workflows/docker-image.yml`): builds a Docker image and pushes to Docker Hub. Triggers on pushes to `master`, `develop`, `ft**` branches and `v*.*.*` tags.
