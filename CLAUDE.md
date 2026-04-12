# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**gui** is the React-based web frontend for the home-anthill IoT platform. It provides a dark-themed dashboard for managing homes, rooms, devices, and sensor features. Built with React 19, Mantine 9, Redux Toolkit (RTK Query), and React Router 7. Uses Nx as the monorepo/build tool and Vite as the bundler.

## Build & Development Commands

```bash
npm install         # Install dependencies
npm run start       # Lint + start dev server (Vite on :4200 with /api proxy)
npm run build       # Lint + dev build → dist/home-anthill/, then copies to ../api-server/public/
npm run build:prod  # Production build → dist/home-anthill/ only (no copy step)
npm run lint        # Run ESLint (flat config via nx lint)
npm run test        # Run vitest (watch mode)
npm run test:coverage # Run tests with coverage report (HTML in ./coverage)
npm run deps        # Upgrade Nx to latest

# Run a single test file:
npx vitest run src/path/to/file.test.tsx
# Run tests matching a name pattern:
npx vitest run -t "test name pattern"
```

**Dev server**: Runs on `http://localhost:4200`. The `proxy.config.json` forwards `/api/*` to `http://localhost:8082` (api-server). The dev proxy requires the backend to be running locally.

**Build output**: Both `npm run build` and `npm run build:prod` output to `dist/home-anthill/`. The `build` command then copies this to `../api-server/public/` for serving as static assets; `build:prod` skips the copy.

**Testing**: Vitest with jsdom environment, React Testing Library, and MSW for API mocking. Tests match `src/**/*.{test,spec}.{ts,tsx}`.

## Architecture

### Directory Structure

```
src/
├── app/
│   ├── devicedetail/         # Unified device detail page (settings + feature controls)
│   │   └── features/         # Feature sub-components: sensor.tsx, controller.tsx, online.tsx
│   ├── devices/              # Device list page + DeviceCard component
│   │   └── devicecard/
│   ├── homes/                # Homes list page
│   │   └── home/             # HomeAccordion component (accordion per home/room)
│   ├── login/                # Login page
│   ├── postlogin/            # Post-OAuth2 token extraction page
│   ├── profile/              # User profile page
│   ├── app.tsx               # App root — renders <RouterProvider>
│   ├── rootlayout.tsx        # Persistent authenticated layout (navbar + <Outlet>)
│   ├── rootlayout.module.scss
│   └── routes.tsx            # Centralized React Router route definitions
├── auth/                     # AuthContext, AuthLayout, ProtectedLayout, auth-utils (localStorage JWT)
├── hooks/                    # Custom hooks wrapping RTK Query (useHomes, useDevices, useRooms, useAuth, etc.)
├── mocks/                    # MSW handlers (handlers.ts, server.ts)
├── models/                   # TypeScript interfaces (Home, Device, Profile, Auth, Value, Online)
├── services/                 # RTK Query endpoint definitions (homes, devices, rooms, values, profile, online)
├── shared/                   # Shared UI components (navbar, ErrorBoundary)
├── styles/                   # Global stylesheets (global.scss, _variables.scss)
├── theme/                    # Mantine theme config (theme.ts)
├── utils/                    # Pure utilities (dateUtils: format Unix epoch / date strings)
├── assets/                   # Static assets (logo.svg)
├── store.ts                  # Redux store + RTK Query setup
├── test-setup.ts             # Vitest + MSW lifecycle setup
├── test-utils.tsx            # Custom render() with MantineProvider + MemoryRouter
├── test-store.tsx            # makeTestStore() + renderHookWithStore() for RTK Query hook tests
└── test-fixtures.ts          # Mock data (mockHome, mockDevice, mockProfile, etc.)
```

### Route Hierarchy

Routes are defined centrally in `src/app/routes.tsx` and rendered via `<RouterProvider>` in `app.tsx`.

```
AuthLayout (AuthProvider)
├── /login       → Login
├── /postlogin   → PostLogin
└── /            → ProtectedLayout → RootLayout (navbar shell)
    ├── / (index) → Devices
    ├── /devices  → Devices
    ├── /devices/:id → DeviceDetail   # unified: settings + feature controls
    ├── /homes    → Homes
    └── /profile  → Profile
```

**Key routing facts:**
- No `/main` prefix — protected routes are children of `/`
- `RootLayout` (`src/app/rootlayout.tsx`) is the persistent shell (navbar + Sonner Toaster + `<Outlet>`)
- Device settings and feature controls are merged into a single `DeviceDetail` page at `/devices/:id`; there is no separate features route
- Homes CRUD (add/edit/delete) and room management happen via modals inside the Homes page — no separate edit route

### State Management / API Pattern

All API calls use **RTK Query** via a single base API (`src/services/common.ts` → `commonApi`) with `injectEndpoints`. Each domain (`homes`, `devices`, `rooms`, `values`, `profile`, `online`) extends it in its own `services/*.ts` file.

**Key RTK Query details:**
- Base query adds the JWT `Authorization: Bearer <token>` header and implements automatic token refresh on 401
- On **401**: calls `POST /api/token/refresh` (browser sends the `refresh_token` HttpOnly cookie automatically), stores the new access token from the JSON response `{ token }`, then retries the original request. Concurrent 401s share a single in-flight refresh via a serialised promise.
- On **403** or refresh failure: removes the access token from `localStorage` and redirects to `/`
- Cache TTL is 60 seconds (`keepUnusedDataFor: 60`)
- Tag-based cache invalidation: mutations specify `invalidatesTags` to refetch related data
- `transformResponse` hooks reshape API responses (e.g., `devices.ts` organizes devices by home and room)
- Per-item tagging is used in `devices.ts` and `values.ts`; `online.ts` uses per-device `{ type: 'Online', id }` tags

**Custom hooks in `src/hooks/`** combine multiple RTK Query hooks and expose a domain-specific interface (e.g., `useHomes` exposes `homes`, `addHome`, `deleteHome`, `updateHome`).

### Auth Flow

1. GitHub OAuth2 → redirect to `/postlogin` with access token in **URL fragment** (`#token=<jwt>`) → parsed via `new URLSearchParams(location.hash.slice(1)).get('token')` → stored in `localStorage` via `auth-utils.tsx`. The `refresh_token` HttpOnly cookie is set by the server and managed automatically by the browser.
2. `AuthProvider` (wraps entire app via `AuthLayout`) provides `login`/`logout`/`isLogged` via `AuthContext`
3. `ProtectedLayout` wraps authenticated routes — redirects to `/login` if `localStorage` has no token
4. When the access token expires the RTK Query base query transparently calls `POST /api/token/refresh`, stores the new token, and retries — no user interaction required. If refresh also fails the user is logged out.

## Tech Stack & Code Style

- React 19, React Router 7, Redux Toolkit 2 (RTK Query)
- **Mantine 9** (`@mantine/core`, `@mantine/hooks`) — primary UI component library; orange primary color, dark theme only
- Tabler Icons (`@tabler/icons-react`) — icon library
- Sonner — toast notifications (rendered in `RootLayout`)
- React Hook Form 7
- Vite (via Nx 22), ESLint 9 (flat config), TypeScript 5.9
- **TypeScript strict mode enabled** — all code must be type-safe
- **Code formatting**: Prettier (single quotes) via ESLint; run `npm run lint` before committing

## Common Development Patterns

**Adding a new page:**
1. Create `src/app/<pagename>/<pagename>.tsx` and a colocated `.module.scss`
2. Add the route to `src/app/routes.tsx` (wrap with `ProtectedLayout` if authenticated)
3. Create a custom hook in `src/hooks/` if the page needs data from multiple endpoints
4. Use `@mantine/core` components; import the dark theme from `src/theme/theme.ts`

**Adding a new API endpoint:**
1. Create a TypeScript interface in `src/models/`
2. Create or extend `src/services/<domain>.ts` using `commonApi.injectEndpoints()`
3. Define queries/mutations with `builder.query()` / `builder.mutation()` and appropriate `invalidatesTags`
4. Export the auto-generated hook; optionally wrap in a custom hook in `src/hooks/`

**Theme:**
- Mantine theme is configured in `src/theme/theme.ts` (orange primary, custom dark palette, spacing/radius)
- Global styles are in `src/styles/global.scss` (imports Mantine CSS, custom scrollbar)
- No light theme support

**SCSS modules:**
- Each page/component has a colocated `.module.scss`
- Import as `import styles from './foo.module.scss'` and use as `className={styles['class-name']}`

## Testing

Tests use **Vitest** with **React Testing Library**, **MSW** for HTTP mocking, and **jsdom** environment. Test files coexist with source files: `src/**/*.{test,spec}.tsx`.

### Test Setup
- `src/test-setup.ts` — Vitest lifecycle (MSW server start/reset/stop), localStorage mock
- `src/test-utils.tsx` — Custom `render()` wrapper that provides `MantineProvider` (dark theme) and `MemoryRouter`
- `src/test-fixtures.ts` — Mock data objects (`mockHome`, `mockDevice`, `mockProfile`, `mockOnlineNow`)
- `src/mocks/server.ts` — MSW server instance
- `src/mocks/handlers.ts` — MSW HTTP request handlers for all API endpoints

### Testing Patterns

**Component tests:**
- Import the custom `render` from `src/test-utils.tsx` (not `@testing-library/react`)
- Use `vi.mock()` to mock auth-utils, image imports, or router functions
- Example:
  ```typescript
  import { describe, it, expect, vi } from 'vitest';
  import { render, screen } from '../../test-utils';
  import Login from './login';

  describe('Login', () => {
    it('renders login button', () => {
      render(<Login />);
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
  });
  ```

**Hook tests (e.g., useHomes, useDevices):**
- Use `renderHookWithStore()` from `src/test-store.tsx` — wraps the hook in a fresh Redux store with RTK Query middleware so each test is isolated
- MSW mocks API responses automatically; wrap async assertions in `waitFor()`
- Override handlers per-test: `server.use(http.get('/api/path', () => ...))`

### Mocking & Fixtures
- Mock data is centralized in `src/test-fixtures.ts`
- MSW handlers in `src/mocks/handlers.ts` cover all API endpoints (homes, devices, rooms, values, profile, online, token refresh)

## CI/CD

GitHub Actions (`.github/workflows/docker-image.yml`): builds a Docker image and pushes to Docker Hub. Triggers on pushes to `master`, `develop`, `ft**` branches and `v*.*.*` tags.