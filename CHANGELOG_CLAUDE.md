# Changelog — Claude-assisted Changes

---

## Features

### Token extracted from URL fragment
**File:** `src/app/postlogin/postLogin.tsx`
The access token delivered by the OAuth2 callback is now read from the URL **fragment** (`#token=<jwt>`) instead of the query string (`?token=<jwt>`). Fragment parameters never leave the browser and do not appear in server access logs, which reduces the token exposure window. Implementation: `new URLSearchParams(location.hash.slice(1)).get('token')`. When no token is found in the fragment the component now actively redirects to `/` instead of silently doing nothing.

### Automatic access-token refresh
**File:** `src/services/common.ts`
`baseQueryWithForceLogout` was replaced with `baseQueryWithReauth`, which implements a transparent refresh flow:
1. Every API response is inspected after the fetch completes.
2. **401** → calls `POST /api/token/refresh` with `credentials: 'include'` so the browser attaches the `refresh_token` HttpOnly cookie. The server returns a new access token as JSON `{ token }` and rotates the `refresh_token` cookie.
3. The new access token is persisted to `localStorage` via `setToken`, then the original request is retried transparently.
4. If the refresh request itself fails (network error, 401, or unexpected response), the access token is removed and the user is redirected to `/`.
5. **403** → immediate logout without a refresh attempt.
6. **Concurrent 401s** are serialised via a module-level `Promise<boolean> | null` mutex (`refreshPromise`). All simultaneous failing requests share the same single refresh call.

### API token visibility control
**File:** `src/app/profile/profile.tsx`
The regenerated API token previously remained in component state and rendered in the DOM indefinitely. Added a "Hide token" button (`IconEyeOff`) next to the copy button. Clicking it calls `setApiToken(null)`, removing the plaintext token from both state and the DOM and reverting the display to the masked placeholder.

---

## Security

### Redux DevTools disabled in production
**File:** `src/store.ts`
`devTools: true` replaced with `devTools: import.meta.env.DEV` so the Redux DevTools extension is only active in development builds.

### Input validation prevents stored XSS
**Files:** `src/app/homes/homes.tsx`
All name and location text fields now validate with a pattern (`/^[a-zA-Z0-9\s\-_]+$/`) to reject payloads that could cause stored XSS.

### Form validation errors displayed in UI
**Files:** `src/app/homes/homes.tsx`
React Hook Form `Controller` now destructures `fieldState` alongside `field`. Each input receives `error` and `helperText` from `fieldState.error`. Validation rules use message objects with user-facing text. The Add Home button click now triggers form validation via `handleSubmit`.

---

## TypeScript Strictness

### `noUncheckedIndexedAccess` enabled
**Files:** `src/test-setup.ts`
Enabled in `tsconfig.json`. Fixed the resulting error in `LocalStorageMock.getItem()` where `this.store[key]` is now `string | undefined`; guarded via `?? null` in the `hasOwnProperty` true-branch.

### `exactOptionalPropertyTypes` enabled
**Files:** `src/app/devicedetail/devicedetails.tsx`, `src/app/devicedetail/features/controller.tsx`, `src/app/devicedetail/features/online.tsx`, `src/app/devicedetail/features/sensor.tsx`, `src/app/devices/devicecard/deviceCard.tsx`, `src/app/homes/home/home.tsx`, `src/app/homes/homes.tsx`, `src/app/login/login.tsx`, `src/app/profile/profile.tsx`, `src/shared/navbar/navbar.tsx`, `src/hooks/useValues.tsx`, `src/test-utils.tsx`
Enabled in `tsconfig.json`. Fixed all resulting errors:
- CSS module bracket access (`styles['key']`) widened to `string | undefined` by `noUncheckedIndexedAccess`; every such access passed to a JSX `className` prop now uses `?? ''`.
- `airQualityColors[val]` in `sensor.tsx` uses `?? ''` for the same reason.
- Avatar `src={profile?.github?.avatarURL}` uses `?? ''` so the value is always `string`.
- `setDeleteTarget({ type, homeId, roomId })` in `homes.tsx` uses a conditional spread `...(roomId !== undefined ? { roomId } : {})` to avoid passing `roomId: undefined` to a type with `roomId?: string`.
- `useGetValuesQuery(..., { skip })` in `useValues.tsx` uses `{ skip: skip ?? false }` so `skip` is always `boolean`.
- `<AllProviders routerProps={routerProps}>` in `test-utils.tsx` uses a conditional spread `{...(routerProps !== undefined ? { routerProps } : {})}`.

### Modern `tsconfig.json`
Updated `tsconfig.json` to current best practices for a Vite + React project:
- `moduleResolution: "bundler"` replaces the outdated `"node"` algorithm
- `target: "ES2022"` and `lib: ["ES2022", "DOM", "DOM.Iterable"]` replace `es2015` / `es2020`
- `isolatedModules: true` catches patterns that fail under esbuild's per-file transpilation
- Removed `emitDecoratorMetadata`, `experimentalDecorators` (unused in React 19), `importHelpers` (no benefit with Vite bundling), `skipDefaultLibCheck` (redundant with `skipLibCheck`), and empty `paths: {}`

---

## Type Safety

### Removed unsafe empty-object defaults from hooks
**Files:** `src/hooks/useProfile.tsx`, `src/hooks/useOnline.tsx`
`data: profile = {} as Profile` and `data: online = {} as Online` were type lies: the empty object default does not conform to the interface but the type system treated it as fully populated. Removed the defaults so `profile` and `online` are now `Profile | undefined`. All consumers handle the `undefined` case via optional chaining or guards.

### Removed `any` types from forwardRef Alert component
**File:** `src/app/features/featuresvalues/controllervalues.tsx`
`props: any, ref: any` replaced with `AlertProps` and `ForwardedRef<HTMLDivElement>`. The `severity` field in `snackBarState` is now typed as `AlertColor` instead of `string`.

### Eliminated `as unknown as` double type assertions
**Files:** `src/services/values.ts`, `src/services/devices.ts`, `src/app/features/featuresvalues/controllervalues.tsx`
`FeatureValue` objects constructed explicitly from `Feature` + `Value` fields. `RoomWithDevices` and `HomeWithDevices` constructed with object spreads, removing all `Object.assign` casts.

### `useParams` typed with generic and null guard
**File:** `src/app/edithome/edithome.tsx`
`useParams().id as string` replaced with `useParams<{ id: string }>()`. Functions guard with `if (!id) return` and render `<Navigate to="..." replace />` when `id` is absent.

### `useForm` typed with explicit generic
**Files:** `src/app/homes/homes.tsx`, `src/app/edithome/edithome.tsx`
`useForm({defaultValues})` replaced with `useForm<{ nameInput: string; locationInput: string }>({defaultValues})` and `useForm<{ rooms: Room[] }>({defaultValues})`.

### Replaced type assertions with null guards
**File:** `src/app/edithome/edithome.tsx`
`home` forced to `Home` via type assertion replaced with `if (!home) { console.error(...); return; }` guards. Removed redundant `as Room` casts and dead `[] as Room[]` assertions.

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
Replaced MUI `ThemeProvider`/`createTheme` with Mantine `MantineProvider` (using `src/theme/theme.ts`). Added `window.matchMedia` mock required by Mantine's color-scheme detection in jsdom.

### Updated existing tests for refactored components
**Files:** `src/app/login/login.test.tsx`, `src/app/homes/homes.test.tsx`, `src/app/profile/profile.test.tsx`
- `login.test.tsx`: fixed asset mock path, updated assertions for new layout and button text.
- `homes.test.tsx`: added `vi.mock('../../hooks/useRooms')`, fixed mock keys, updated text assertions, fixed modal open/close test logic.
- `profile.test.tsx`: removed stale asset mock, fixed button name regex, rewrote token regeneration test to click through the confirmation modal.

### Added tests for device detail features
**Files (new):** `src/app/devicedetail/devicedetails.test.tsx`, `src/app/devicedetail/features/sensor.test.tsx`, `src/app/devicedetail/features/online.test.tsx`, `src/app/devicedetail/features/controller.test.tsx`
- `sensor.test.tsx`: empty-features guard, heading, temperature/humidity/motion/airquality formatting, unit suppression.
- `online.test.tsx`: empty-features guard, Presence heading, Present/Absent values, multiple cards.
- `controller.test.tsx`: empty-features guard, Controls heading, Send Commands button, Switch/Slider/Select per feature type, `onSend`/`onChangeValue` callbacks, last-sent info, `isSending` disabled state.
- `devicedetails.test.tsx`: loading state, no-device error state, MAC fallback title, model/MAC details, room location, Back navigation, settings modal open/close, delete modal open/close, full delete flow.

### Added tests for shared and page components
**Files (new):** `src/app/devices/devices.test.tsx`, `src/app/devices/devicecard/deviceCard.test.tsx`, `src/app/homes/home/home.test.tsx`, `src/shared/navbar/navbar.test.tsx`, `src/shared/errorboundary/ErrorBoundary.test.tsx`, `src/shared/notfound/notfoundpage.test.tsx`
Coverage for: loading/error/empty/data states, navigation calls, modal interactions, click handlers, context integration.

---

## Bug Fixes

### Crash when navigating directly to Features/DeviceSettings pages
**Files:** `src/app/features/features.tsx`, `src/app/devicesettings/devicesettings.tsx`
Components received navigation state via `useLocation()` with no guard, causing a runtime crash when navigated to directly. All hooks are called unconditionally first (Rules of Hooks); a `<Navigate>` guard is placed after all hooks and before JSX return.

### `useEffect` missing dependency array causes infinite loops
**File:** `src/app/postlogin/postLogin.tsx`
`useEffect(() => { ... })` (no deps array) ran on every render, risking infinite navigation loops. Added `[location, navigate, login]` as the dependency array.

### Fixed double Unix-epoch conversion in Online component
**File:** `src/app/devicedetail/features/online.tsx`
`getPrettyDateFromUnixEpoch(new Date(feature.modifiedAt).getTime())` converted `feature.modifiedAt` (already milliseconds) to a `Date` and back to milliseconds — a no-op. Changed to `getPrettyDateFromUnixEpoch(feature.modifiedAt)`.

### Fixed `isSending` always false in ControllerFeature
**Files:** `src/app/devicedetail/devicedetails.tsx`, `src/hooks/useValues.tsx`
`isSending={false}` was hardcoded. Added `isSending: setValuesLoading` to the `useValues` return and updated `DeviceDetail` to destructure and pass it correctly.

### Fixed Alert.onClose signature mismatch
**File:** `src/app/features/featuresvalues/controllervalues.tsx`
`handleSnackbarClose` had `reason: string` as a required second parameter, making it incompatible with `Alert.onClose`. Changed to `reason?: string` (optional) and switched `setSnackBarState` to the functional-update form to eliminate the stale-closure risk.

### Dead null guards removed from device rendering
**File:** `src/app/devices/devices.tsx`
`showDeviceSettings` and `showDevice` each began with `if (!device) { ... return; }`, but both receive `device: Device` (non-nullable), making the guards unreachable. Removed.

---

## Performance & Rendering

### `useState` + `useEffect` feature sync replaced with `useMemo` + localOverrides
**File:** `src/app/devicedetail/devicedetails.tsx`
`useState<FeatureValue[]>([])` combined with a `useEffect` caused a flash of empty state on every data load (effect fires after paint). Replaced with:
- `const [localOverrides, setLocalOverrides] = useState<Record<string, number>>({})` — tracks only user-changed values
- `const featureValues = useMemo(...)` — derives values synchronously from `deviceWithValues` and `localOverrides`, eliminating the extra render cycle

### Memoized Select options in DeviceDetail
**File:** `src/app/devicedetail/devicedetails.tsx`
`data={homes.map(h => ({ value: h.id, label: h.name }))}` allocated a new array on every render. Replaced with `useMemo`.

### Event handlers wrapped in `useCallback`
**Files:** `src/app/homes/homes.tsx`, `src/app/devicesettings/devicesettings.tsx`
`editHome`, `removeHome`, `handleOpen`, `handleClose`, `onChangeHome`, `onChangeRoom`, `onAssign`, `onRemove` wrapped in `useCallback` with stable dependency arrays.

### `DeviceCard` wrapped with `React.memo`
**File:** `src/app/devices/devicecard/deviceCard.tsx`
`DeviceCard` was re-rendering on every parent re-render regardless of prop changes. Wrapped with `React.memo`; RTK Query returns stable references for unchanged data so the shallow comparison correctly skips re-renders for unmodified cards.

### Helper functions moved to module scope
**Files:** `src/app/features/featuresvalues/onlinevalue/onlinevalue.tsx`, `src/utils/dateUtils.ts`, `src/app/devicedetail/features/controller.tsx`
- `isOffline` moved to module scope to prevent needless re-creation on each render.
- Duplicate `padL` and `formatDate` helpers extracted to module scope once, eliminating duplication.
- `renderControl` extracted as a proper `ControlInput` component at module scope, enabling correct React reconciliation across renders.

### Styled components moved to module scope
**File:** `src/app/homes/homecard/homeCard.tsx`
`ExpandMore` (a `styled` MUI component) was defined inside the render body, causing React to unmount/remount the DOM subtree on every render. Moved to module scope.

### Unique keys for list items
**Files:** `src/app/devices/devices.tsx`, `src/app/edithome/edithome.tsx`
`key={home.name + home.location}` and `key={room.name + room.floor}` replaced with `key={home.id}` and `key={room.id}`. `useFieldArray` key changed from `key={\`room-${index}\`}` to `key={item.uniqueid}`.

### Stable keys for static feature list
**File:** `src/app/login/login.tsx`
The `features` array used `key={title}`, coupling reconciliation identity to display text. Added an `id` field to each feature object and updated the map to `key={id}`.

### `useEffect` dependency optimization
**File:** `src/app/features/featuresvalues/controllervalues.tsx`
The `useEffect` dependency array contained the entire `props` object reference, causing the effect to re-run on every parent re-render. Changed to `props.deviceWithValues`.

---

## State Management

### Per-item cache tag granularity
**Files:** `src/services/devices.ts`, `src/services/values.ts`
- `devices.ts` `providesTags`: changed from the coarse `['Devices']` to per-device tags `{ type: 'Devices', id }` plus a `{ type: 'Devices', id: 'LIST' }` sentinel. Mutation invalidation targets specific device IDs.
- `values.ts` `providesTags`: changed from `['Values']` to `[{ type: 'Values', id: arg.id }]` so only the affected device's value cache is invalidated on mutation.

### `Object.assign` replaced with spread operator
**File:** `src/services/devices.ts`
`const home = Object.assign({}, h)` and `Object.assign({}, room)` inside `transformResponse` replaced with `{ ...h, rooms: [] }` and `{ ...room, devices: [] }`.

### `useValues` hook accepts optional device
**File:** `src/hooks/useValues.tsx`
Changed the hook signature from `device: Device` to `device: Device | undefined`. When `device` is `undefined`, `useGetValuesQuery` uses RTK Query's `skipToken` to skip the network request, enabling unconditional hook calls (Rules of Hooks).

### Removed pointless `useCallback` wrappers from hooks
**Files:** `src/hooks/useHomes.tsx`, `src/hooks/useProfile.tsx`
`deleteHome`, `addHome`, `updateHome`, and `newProfileToken` were wrapped in `useCallback` but their consumers are not memoized and the RTK Query mutation functions they forward are already stable references. Removed the wrappers.

---

## Error Handling

### Top-level Error Boundary
**Files:** `src/shared/errorboundary/ErrorBoundary.tsx` *(new)*, `src/app/app.tsx`
Created a class-based `ErrorBoundary` component (React's only supported mechanism for catching render errors) that renders a centered fallback UI with a "Reload" button instead of a blank screen. `App` now wraps `<RouterProvider>` with `<ErrorBoundary>`.

### Loading/error early returns added to Homes page
**File:** `src/app/homes/homes.tsx`
Added `homesLoading` guard (shows `<Loader>`) and `homesError` guard (shows red `<Alert>`). `handleSaveHome`, `handleSaveRoom`, and `handleConfirmDelete` now wrap mutations in try/catch with `toast.error` feedback.

### `try/catch` added to DeviceDetail handlers
**File:** `src/app/devicedetail/devicedetails.tsx`
`handleSaveSettings` and `handleDeleteDevice` lacked try/catch blocks, causing unhandled promise rejections on mutation failure. Wrapped both with try/catch; errors are surfaced via `toast.error`.

### Console logging improved with error objects
**Files:** `src/app/devicesettings/devicesettings.tsx`, `src/app/edithome/edithome.tsx`, `src/app/homes/homes.tsx`, `src/app/profile/profile.tsx`, `src/app/features/featuresvalues/controllervalues.tsx`
Catch blocks that called `console.error(message)` without forwarding the caught error updated to `console.error(message, err)`.

### Debug code removed from production
**Files:** `src/app/features/featuresvalues/sensorvalue.tsx`, `src/app/features/featuresvalues/controllervalues.tsx`, `src/app/login/login.tsx`, `src/app/postlogin/postLogin.tsx`, `src/app/devicedetail/devicedetails.tsx`, `src/app/devices/devicecard/deviceCard.tsx`
Removed `console.log` calls logging props, API responses, and navigation events. Removed `<div>{location.pathname}</div>` from PostLogin UI.

---

## Code Quality & Refactoring

### Prop drilling on HomeAccordion eliminated via context
**Files:** `src/app/homes/HomesActionsContext.tsx` *(new)*, `src/app/homes/homes.tsx`, `src/app/homes/home/home.tsx`
Created `HomesActionsContext` providing the five home/room action callbacks. `HomeAccordion`'s prop interface reduced from six props to one (`home`); callbacks consumed via `useHomesActions()`. `actionsValue` memoized with `useMemo` in `Homes`.

### Eliminated prop drilling onClick wrapper
**File:** `src/app/homes/homes.tsx`
Both "Add Home" buttons used `onClick={() => handleOpenHomeModal()}` where the wrapper added no value. Replaced with `onClick={handleOpenHomeModal}` directly. (Later reverted to `onClick={() => handleOpenHomeModal()}` to satisfy the TypeScript `MouseEventHandler` signature after `handleOpenHomeModal` was given an optional `homeId` parameter.)

### Named constants for magic values
**Files:** `src/app/features/featuresvalues/onlinevalue/onlinevalue.tsx`, `src/app/features/featuresvalues/controllervalues.tsx`
`OFFLINE_THRESHOLD_MS`, `SETPOINT_VALUES`, `HVAC_MODES`, `FAN_SPEEDS`, `TOLERANCE_VALUES` extracted to module-scope constants.

### Duplicate interface removed
**File:** `src/app/profile/profile.tsx`
Local `interface ProfileTokenResponse` was identical to the one exported from `src/models/profile.tsx`. Replaced with an import.

### Unused variables and imports removed
**Files:** `src/hooks/useDevices.tsx`, `src/app/devices/devices.tsx`, `src/services/common.ts`, `src/shared/notfound/notfoundpage.test.tsx`
- Removed unused `DevicesResponse` import from `useDevices.tsx`.
- Removed unused `Device`, `DevicesResponse` imports and `const navigate = useNavigate()` from `devices.tsx`.
- Replaced `catch (err: unknown)` with bare `catch` in `common.ts` where `err` was not used.
- Removed unused `vi` import from `notfoundpage.test.tsx`.

### Redundant array spreads removed
**File:** `src/app/devicedetail/devicedetails.tsx`
`handleControlChange` used `[...featureValues].map(...)` then `setFeatureValues([...fv])` — two redundant copies. Collapsed to a single expression.

### Unused response variables removed
**Files:** `src/app/homes/homes.tsx`, `src/app/devicesettings/devicesettings.tsx`, `src/app/edithome/edithome.tsx`
`const response = await mutation().unwrap()` patterns where the return value was never read simplified to `await mutation().unwrap()`.

### `homesLoading` exposed separately in `useHomes`
**File:** `src/hooks/useHomes.tsx`
Added `homesLoading` as a separate field in the return object so consumers can distinguish the initial page-load state from ongoing mutation loading state.

---

## UI

### Login page uses dedicated logo asset
**File:** `src/app/login/login.tsx`
The shared `logo.svg` asset was replaced with a dedicated `login-brand-logo.svg` import, decoupling the login page's visual identity from the rest of the app. `Text` components in the brand column and login card received explicit `className` props for fine-grained SCSS module styling.
