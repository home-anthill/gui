# Changelog — Claude-assisted Changes

---

## Major Redesign: MUI → Mantine 9

The entire web application was rebuilt from the ground up, replacing Material UI with **Mantine 9** as the primary component library and restructuring the page hierarchy to eliminate redundant routes.

### UI library migration — MUI → Mantine 9
**Files:** all component files under `src/app/`, `src/shared/`, `src/theme/`, `src/styles/`
Material UI (MUI v5) was fully removed and replaced with **Mantine 9** (`@mantine/core`, `@mantine/hooks`). Every component was rewritten using Mantine primitives (`Button`, `TextInput`, `NumberInput`, `Select`, `Modal`, `Accordion`, `Paper`, `Title`, `Text`, `Loader`, `Alert`, `Avatar`, `Drawer`, `NavLink`, `Burger`, etc.). The custom theme (`src/theme/theme.ts`) was migrated to `createTheme` from `@mantine/core` with an orange primary colour and a forced dark colour scheme. MUI icon imports were replaced with **Tabler Icons** (`@tabler/icons-react`). MUI Snackbar was replaced with **Sonner** toast notifications rendered inside `RootLayout`.

### Unified DeviceDetail page
**Files:** `src/app/devicedetail/devicedetails.tsx`, `src/app/devicedetail/features/sensor.tsx`, `src/app/devicedetail/features/controller.tsx`, `src/app/devicedetail/features/online.tsx`
The previous architecture split device management across three separate routes: a device list, a settings page (`devicesettings/`), and a features page (`features/`), requiring navigation state to be passed via `useLocation`. All three were merged into a single `DeviceDetail` page at `/devices/:id`. Settings (name, home/room assignment, delete) are handled via modals opened inline. Feature display is delegated to three focused sub-components — `SensorFeature`, `ControllerFeature`, `OnlineFeature` — colocated in `devicedetail/features/`. The old `devicesettings/`, `features/`, and `features/featuresvalues/` directories were deleted entirely.

### Deleted page directories
The following directories and their contents were removed as part of the redesign:
- `src/app/devicesettings/` — merged into `DeviceDetail` modals
- `src/app/edithome/` — home editing now handled via modals inside `Homes`
- `src/app/features/` — replaced by `src/app/devicedetail/features/`
- `src/app/homes/homecard/` — `HomeCard` replaced by `HomeAccordion` in `src/app/homes/home/`

### Responsive navbar
**File:** `src/shared/navbar/navbar.tsx`
The top navigation bar was rewritten using Mantine components. On desktop it renders an inline horizontal nav; on mobile it switches to a `Burger` button that opens a `Drawer` slide-in panel. Navigation items are defined as a typed `NAV_ITEMS` constant. The profile avatar navigates to `/profile` and is keyboard-accessible (`tabIndex`, `onKeyDown`).

### Centralised routing with React Router 7
**Files:** `src/app/routes.tsx`, `src/app/app.tsx`
All routes are now defined in a single `routes.tsx` file using `createBrowserRouter`. `App` renders `<RouterProvider router={router}>`. The route tree uses `AuthLayout` → `ProtectedLayout` → `RootLayout` as nested layouts, matching the auth and persistence model described in CLAUDE.md. There is no `/main` prefix; authenticated routes live directly under `/`.

### SCSS modules throughout
Every page and component now has a colocated `.module.scss` file for scoped styling. Global styles and variables are consolidated in `src/styles/global.scss` and `src/styles/_variables.scss`. No inline style objects or MUI `sx` props remain.

---

## Features

### Token extracted from URL fragment
**File:** `src/app/postlogin/postLogin.tsx`
The access token delivered by the OAuth2 callback is read from the URL **fragment** (`#token=<jwt>`) instead of the query string. Fragment parameters never leave the browser and do not appear in server access logs. Implementation: `new URLSearchParams(location.hash.slice(1)).get('token')`. When no token is found the component redirects to `/`.

### Automatic access-token refresh
**File:** `src/services/common.ts`
`baseQueryWithReauth` implements a transparent refresh flow: on **401** it calls `POST /api/oauth/refresh` with `credentials: 'include'`, stores the new access token from `{ token }`, then retries the original request. On **403** or refresh failure the access token is removed and the user is redirected to `/`. Concurrent 401s are serialised via a module-level `Promise<boolean> | null` mutex (`refreshPromise`). Call `_resetRefreshPromise()` in test teardown to prevent cross-test leakage.

### Server-side logout
**Files:** `src/services/profile.ts`, `src/hooks/useProfile.tsx`, `src/app/profile/profile.tsx`
Profile logout now calls `POST /api/oauth/logout` with `credentials: 'include'` before clearing the local access token and navigating to `/login`. The local cleanup still runs if the server-side logout request fails, so the user is not trapped in an authenticated view.

### API token visibility control
**File:** `src/app/profile/profile.tsx`
After token regeneration a "Hide token" button (`IconEyeOff`) is shown alongside the copy button. Clicking it calls `setApiToken(null)`, removing the plaintext token from both state and the DOM.

---

## Security

### Redux DevTools disabled in production
**File:** `src/store.ts`
`devTools: import.meta.env.DEV` ensures the Redux DevTools extension is only active in development builds.

### Input validation prevents stored XSS
**File:** `src/app/homes/homes.tsx`
All name and location text fields validate with `/^[a-zA-Z0-9\s\-_]+$/` to reject payloads that could cause stored XSS.

---

## TypeScript Strictness

### `noUncheckedIndexedAccess` enabled
**File:** `src/test-setup.ts`
Enabled in `tsconfig.json`. Fixed the resulting error in `LocalStorageMock.getItem()` where `this.store[key]` is now `string | undefined`; guarded via `?? null`.

### `exactOptionalPropertyTypes` enabled
**Files:** `src/app/devicedetail/devicedetails.tsx`, `src/app/devicedetail/features/controller.tsx`, `src/app/devicedetail/features/online.tsx`, `src/app/devicedetail/features/sensor.tsx`, `src/app/devices/devicecard/deviceCard.tsx`, `src/app/homes/home/home.tsx`, `src/app/homes/homes.tsx`, `src/app/login/login.tsx`, `src/app/profile/profile.tsx`, `src/shared/navbar/navbar.tsx`, `src/hooks/useValues.tsx`, `src/test-utils.tsx`
Enabled in `tsconfig.json`. Fixed all resulting errors:
- CSS module bracket access passed to JSX `className` props uses `!` non-null assertion (keys are always defined when SCSS is properly imported; `?? ''` would be dead code).
- `setDeleteTarget({ type, homeId, roomId })` in `homes.tsx` uses a conditional spread `...(roomId !== undefined ? { roomId } : {})`.
- `useGetValuesQuery(..., { skip })` in `useValues.tsx` uses `{ skip: skip ?? false }`.
- `<AllProviders routerProps={routerProps}>` in `test-utils.tsx` uses `{...(routerProps !== undefined ? { routerProps } : {})}`.

### Modern `tsconfig.json`
Updated to current best practices for a Vite + React project:
- `moduleResolution: "bundler"` replaces `"node"`
- `target: "ES2022"` and `lib: ["ES2022", "DOM", "DOM.Iterable"]`
- `isolatedModules: true` catches patterns that fail under esbuild's per-file transpilation
- Removed unused decorator, import-helper, and redundant lib-check options

---

## Type Safety

### Removed unsafe empty-object defaults from hooks
**Files:** `src/hooks/useProfile.tsx`, `src/hooks/useOnline.tsx`
`data: profile = {} as Profile` and `data: online = {} as Online` removed. `profile` and `online` are now `Profile | undefined`. All consumers handle the `undefined` case via optional chaining or guards.

### Unsafe device hook default replaced
**File:** `src/hooks/useDevices.tsx`
`data: homeDevices = {} as DevicesResponse` replaced with `{ unassignedDevices: [], homeDevices: [] }`, which satisfies the full `DevicesResponse` shape without a type assertion.

### Missing `name` field added to test fixtures
**File:** `src/test-fixtures.ts`
`mockDevice`, `mockDevice2`, and `mockDeviceWithValues` were missing the required `name: string` field from the `Device` interface. Added `name: ''` to each.

---

## Test Suite

### Migrated test infrastructure to Mantine 9
**Files:** `src/test-setup.ts`, `src/test-utils.tsx`
Replaced MUI `ThemeProvider`/`createTheme` with Mantine `MantineProvider` (using `src/theme/theme.ts`). Added `window.matchMedia` mock required by Mantine's colour-scheme detection in jsdom.

### Tests for device detail features
**Files:** `src/app/devicedetail/devicedetails.test.tsx`, `src/app/devicedetail/features/sensor.test.tsx`, `src/app/devicedetail/features/online.test.tsx`, `src/app/devicedetail/features/controller.test.tsx`
- `sensor.test.tsx`: empty-features guard, heading, temperature/humidity/motion/air-quality formatting, unit suppression.
- `online.test.tsx`: empty-features guard, Presence heading, Present/Absent values, multiple cards.
- `controller.test.tsx`: empty-features guard, Controls heading, Send Commands button, Switch/Slider/Select per feature type, `onSend`/`onChangeValue` callbacks, last-sent info, `isSending` disabled state.
- `devicedetails.test.tsx`: loading state, no-device error state, MAC fallback title, model/MAC details, room location, Back navigation, settings modal open/close, delete modal open/close, full delete flow.

### Tests for shared and page components
**Files:** `src/app/devices/devices.test.tsx`, `src/app/devices/devicecard/deviceCard.test.tsx`, `src/app/homes/home/home.test.tsx`, `src/shared/navbar/navbar.test.tsx`, `src/shared/errorboundary/ErrorBoundary.test.tsx`, `src/shared/notfound/notfoundpage.test.tsx`
Coverage for: loading/error/empty/data states, navigation calls, modal interactions, click handlers, context integration.

### Tests for profile logout
**File:** `src/app/profile/profile.test.tsx`
Added coverage for the server-side logout flow. The test verifies that clicking Logout calls the profile logout mutation and removes the local access token.

---

## Error Handling

### Top-level Error Boundary
**Files:** `src/shared/errorboundary/ErrorBoundary.tsx`, `src/app/app.tsx`
Class-based `ErrorBoundary` renders a centred fallback UI with a "Reload" button instead of a blank screen. `App` wraps `<RouterProvider>` with `<ErrorBoundary>`.

### Loading/error early returns added to Homes page
**File:** `src/app/homes/homes.tsx`
Added `homesLoading` guard (shows `<Loader>`) and `homesError` guard (shows red `<Alert>`). `handleSaveHome`, `handleSaveRoom`, and `handleConfirmDelete` wrap mutations in try/catch with `logError` feedback.

---

## State Management

### Per-item cache tag granularity
**Files:** `src/services/devices.ts`, `src/services/values.ts`
`devices.ts` `providesTags` changed from coarse `['Devices']` to per-device `{ type: 'Devices', id }` plus a `LIST` sentinel. `values.ts` uses `[{ type: 'Values', id: arg.id }]` so only the affected device's value cache is invalidated on mutation.

### `useValues` hook accepts optional device
**File:** `src/hooks/useValues.tsx`
Changed the hook signature from `device: Device` to `device: Device | undefined`. When `device` is `undefined`, RTK Query's `skipToken` skips the network request, enabling unconditional hook calls (Rules of Hooks).

### Prop drilling on HomeAccordion eliminated via context
**Files:** `src/app/homes/HomesActionsContext.tsx`, `src/app/homes/homes.tsx`, `src/app/homes/home/home.tsx`
Created `HomesActionsContext` providing the five home/room action callbacks. `HomeAccordion`'s prop interface reduced from six props to one (`home`); callbacks consumed via `useHomesActions()`. `actionsValue` memoised with `useMemo` in `Homes`.

### `homesLoading` exposed separately in `useHomes`
**File:** `src/hooks/useHomes.tsx`
Added `homesLoading` as a separate field so consumers can distinguish the initial page-load state from ongoing mutation loading.

---

## Performance & Rendering

### `useState` + `useEffect` feature sync replaced with `useMemo` + localOverrides
**File:** `src/app/devicedetail/devicedetails.tsx`
Replaced with `localOverrides: Record<string, number>` (tracks only user-changed values) and `featureValues` derived synchronously via `useMemo`, eliminating the extra render cycle and flash of empty state.

### Event handlers wrapped in `useCallback`
**File:** `src/app/homes/homes.tsx`
`editHome`, `removeHome`, `handleOpen`, `handleClose`, and related callbacks wrapped in `useCallback` with stable dependency arrays.

### `DeviceCard` wrapped with `React.memo`
**File:** `src/app/devices/devicecard/deviceCard.tsx`
Wrapped with `React.memo`; RTK Query returns stable references for unchanged data so the shallow comparison correctly skips re-renders for unmodified cards.

### `isSending` always false in ControllerFeature — fixed
**Files:** `src/app/devicedetail/devicedetails.tsx`, `src/hooks/useValues.tsx`
`isSending={false}` was hardcoded. Added `isSending: setValuesLoading` to the `useValues` return and updated `DeviceDetail` to pass it correctly.

---

## Code Quality

### `useEffect` one-shot guard with `useRef`
**File:** `src/app/postlogin/postLogin.tsx`
Uses a `useRef<boolean>(false)` guard to ensure the token extraction + `login()` call runs exactly once, even under React StrictMode double-invocation.

### Removed pointless `useCallback` wrappers from hooks
**Files:** `src/hooks/useHomes.tsx`, `src/hooks/useProfile.tsx`
`deleteHome`, `addHome`, `updateHome`, and `newProfileToken` had `useCallback` wrappers whose consumers are not memoised and whose RTK Query mutation functions are already stable. Removed.

### Form validation errors displayed in UI
**File:** `src/app/homes/homes.tsx`
React Hook Form `Controller` destructures `fieldState` alongside `field`. Each input receives `error` from `fieldState.error`. Validation rules use message objects with user-facing text.
