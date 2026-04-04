# Changelog — Fixes and Improvements by Claude

## Bugs Fixed

### Crash when navigating directly to Features/DeviceSettings pages
**Files:** `src/app/features/features.tsx`, `src/app/devicesettings/devicesettings.tsx`
Components received navigation state (`device`, `home`, `room`) via `useLocation()` with no guard, causing a runtime crash when navigated to directly. All hooks are called unconditionally first (Rules of Hooks); a `<Navigate to="/main/devices" replace />` guard is placed after all hooks and before JSX return.

### useEffect missing dependency array causes infinite loops
**File:** `src/app/postlogin/postLogin.tsx`
`useEffect(() => { ... })` (no deps array) ran on every render, risking infinite navigation loops. Added `[location, navigate, login]` as the dependency array.

### Unsafe type-cast default crashes on property access
**File:** `src/hooks/useDevices.tsx`
`data: homeDevices = {} as DevicesResponse` was a type-cast empty object that would crash on `.length` access. Replaced with `{ unassignedDevices: [], homeDevices: [] }` which satisfies the full `DevicesResponse` shape without a type assertion.

### Dead null guards in device rendering
**File:** `src/app/devices/devices.tsx`
`showDeviceSettings` and `showDevice` each began with `if (!device) { console.error(...); return; }`, but both functions receive `device: Device` (non-nullable), making the guard unreachable. Removed the dead branches.

---

## Security

### Redux DevTools disabled in production
**File:** `src/store.ts`
`devTools: true` replaced with `devTools: import.meta.env.DEV` so the Redux DevTools extension is only active in development builds, preventing state and action inspection in production.

### Input validation prevents stored XSS
**Files:** `src/app/homes/homes.tsx`, `src/app/edithome/edithome.tsx`
All name and location text fields previously only validated `required` and `maxLength`. Added `pattern: /^[a-zA-Z0-9\s\-_]+$/` to React Hook Form rules for home name, home location, and room name fields to reject payloads that could cause stored XSS.

### Form validation errors displayed in UI
**Files:** `src/app/homes/homes.tsx`, `src/app/edithome/edithome.tsx`
React Hook Form `Controller` now destructures `fieldState` alongside `field`. Each `TextField` receives `error={!!fieldState.error}` and `helperText={fieldState.error?.message ?? ''}`. Validation rules updated from bare booleans to message objects with user-facing text. `onAddHome` refactored to use `handleSubmit` wrapping so the button click also triggers form validation (previously bypassed validation entirely by calling `getValues()` directly).

---

## Type Safety

### Removed `any` types from forwardRef Alert component
**File:** `src/app/features/featuresvalues/controllervalues.tsx`
`props: any, ref: any` replaced with `AlertProps` and `ForwardedRef<HTMLDivElement>`. The `Alert` component was moved outside the `ControllerValues` function body to prevent re-creation on every render. The `severity` field in `snackBarState` is now typed as `AlertColor` instead of `string`.

### Eliminated `as unknown as` double type assertions
**Files:** `src/services/values.ts`, `src/services/devices.ts`, `src/app/features/featuresvalues/controllervalues.tsx`
- `values.ts`: `FeatureValue` objects constructed explicitly from `Feature` + `Value` fields instead of `Object.assign({}, feature) as unknown as FeatureValue`. Missing-value branch also returns a properly typed object.
- `devices.ts`: `RoomWithDevices` constructed with `{ ...room, devices: [] }` and `HomeWithDevices` with `{ ...h, rooms: [] }`, removing `Object.assign` casts.
- `controllervalues.tsx`: A `useMemo` adapter converts `DeviceWithValuesResponse` → `Device` so `useValues` receives a correctly typed argument.

### useParams typed with generic and null guard
**File:** `src/app/edithome/edithome.tsx`
`useParams().id as string` replaced with `useParams<{ id: string }>()`. Functions that use `id` guard with `if (!id) return`, and a `<Navigate to="/main/homes" replace />` fallback is rendered when `id` is absent.

### useForm typed with explicit generic
**Files:** `src/app/homes/homes.tsx`, `src/app/edithome/edithome.tsx`
`useForm({defaultValues})` replaced with `useForm<{ nameInput: string; locationInput: string }>({defaultValues})` and `useForm<{ rooms: Room[] }>({defaultValues})` for full type-safety of form values.

### Replaced type assertions with null guards
**File:** `src/app/edithome/edithome.tsx`
Both `updateRoom` and `addRoom` calls inside `onSaveRoom` previously forced `home` (which is `Home | undefined`) to `Home` via type assertion. Replaced with `if (!home) { console.error(...); return; }` before each usage. Also removed redundant `as Room` casts on `updateRoom`/`addRoom` calls and dead `[] as Room[]` assertions from `useForm` defaultValues.

### useValues hook accepts optional device
**File:** `src/hooks/useValues.tsx`
Changed the hook signature from `device: Device` to `device: Device | undefined`. When `device` is `undefined`, the internal `useGetValuesQuery` call uses RTK Query's `skipToken` to skip the network request entirely. This enables components to call `useValues` unconditionally (required by Rules of Hooks) while still guarding against missing navigation state.

---

## Performance & Rendering Optimization

### Event handlers wrapped in useCallback
**Files:** `src/app/homes/homes.tsx`, `src/app/devicesettings/devicesettings.tsx`
- `homes.tsx`: `editHome`, `removeHome`, `handleOpen`, `handleClose` wrapped in `useCallback` with stable dependencies.
- `devicesettings.tsx`: `onChangeHome`, `onChangeRoom`, `onAssign`, `onRemove` converted to `useCallback` with correct dependency arrays, preventing unnecessary re-creation on every render.

### Styled components moved to module scope
**File:** `src/app/homes/homecard/homeCard.tsx`
`ExpandMore` (a `styled` MUI component) was defined inside the `HomeCard` render body, causing React to treat it as a new component type on every render and unmount/remount the DOM subtree. Moved `ExpandMoreProps` interface and `ExpandMore` to module scope.

### useEffect dependency optimization
**File:** `src/app/features/featuresvalues/controllervalues.tsx`
The `useEffect` dependency array contained the entire `props` object reference. Because `props` is a new reference on every render, this caused the effect to re-run on every parent re-render. Changed to `props.deviceWithValues` to track only the relevant data dependency.

### Helper functions moved to module scope
**Files:** `src/app/features/featuresvalues/onlinevalue/onlinevalue.tsx`, `src/utils/dateUtils.ts`
- `onlinevalue.tsx`: `isOffline` (a plain function with no closure) moved to module scope to prevent needless re-creation on each render.
- `dateUtils.ts`: Duplicate `padL` helper and `formatDate` were defined identically inside both `getPrettyDateFromUnixEpoch` and `getPrettyDateFromDateString`. Extracted once to module scope, eliminating duplication.

### Unique keys for list items
**File:** `src/app/devices/devices.tsx`
- `key={home.name + home.location}` and `key={room.name + room.floor}` replaced with `key={home.id}` and `key={room.id}`. String concatenation of display values is not guaranteed unique; IDs are.
- `src/app/edithome/edithome.tsx`: `useFieldArray` key changed from `key={`room-${index}`}` to `key={item.uniqueid}` so room form components are not re-created when items are reordered or removed. The explicit `: Room` type cast on the `.map()` parameter was also removed.

---

## State Management & Caching

### Per-item cache tag granularity
**Files:** `src/services/devices.ts`, `src/services/values.ts`
- `devices.ts` `providesTags`: changed from the coarse `['Devices']` to per-device tags `{ type: 'Devices', id }` for every device in `unassignedDevices` and all home/room devices, plus a `{ type: 'Devices', id: 'LIST' }` sentinel. `deleteDevice` invalidation updated to target the specific device ID plus `'LIST'`. `assignDevice` invalidation uses `{ type: 'Devices', id: 'LIST' }` instead of the bare string tag.
- `values.ts` `providesTags`: changed from `['Values']` to `[{ type: 'Values', id: arg.id }]`. `invalidatesTags` updated to `[{ type: 'Values', id: arg.deviceId }]` so only the affected device's value cache is invalidated on mutation.

### Object.assign replaced with spread operator
**File:** `src/services/devices.ts`
`const home = Object.assign({}, h)` and `Object.assign({}, room)` inside `transformResponse` replaced with explicit object spreads `{ ...h, rooms: [] }` and `{ ...room, devices: [] }`. This eliminates double type assertions and ensures the compiler validates the shape.

### Unused variables removed
**Files:** `src/app/homes/homes.tsx`, `src/app/devicesettings/devicesettings.tsx`, `src/app/edithome/edithome.tsx`
`const response = await mutation().unwrap()` and `const result = await mutation().unwrap()` patterns where the return value was never read were simplified to `await mutation().unwrap()`.

---

## Code Organization & Constants

### Named constants for magic values
**Files:**
- `src/app/features/featuresvalues/onlinevalue/onlinevalue.tsx`: `const OFFLINE_THRESHOLD_MS = 60 * 1000` (one minute, in milliseconds) at module scope, replacing an inline magic number.
- `src/app/features/featuresvalues/controllervalues.tsx`: Inline magic arrays and values replaced with module-scope constants:
  - `SETPOINT_VALUES`: temperature range 17–30°C
  - `HVAC_MODES`: `[{value, label}]` pairs for Cool/Auto/Heat/Fan/Dry
  - `FAN_SPEEDS`: `[{value, label}]` pairs for Min/Med/Max/Auto/Auto0
  - `TOLERANCE_VALUES`: 0–10

### Duplicate interface removed
**File:** `src/app/profile/profile.tsx`
The local `interface ProfileTokenResponse { apiToken: string }` was identical to the one already exported from `src/models/profile.tsx`. The local definition was removed and replaced with an import from the models module.

### Removed unused type imports
**File:** `src/hooks/useDevices.tsx`
Removed the now-unused `DevicesResponse` import after replacing unsafe type casting with a proper default object.

---

## Error Handling & Debugging

### Error Boundary added to app root
**Files:** `src/shared/ErrorBoundary.tsx` *(new)*, `src/app/app.tsx`
Created a class-based `ErrorBoundary` component that catches render errors, logs them via `componentDidCatch`, and displays a user-friendly fallback UI. The `RouterProvider` in `App` is now wrapped with `<ErrorBoundary>`, preventing unhandled component errors from crashing the entire application.

### Console logging improved with error objects
**Files:** `src/app/devicesettings/devicesettings.tsx`, `src/app/edithome/edithome.tsx`, `src/app/homes/homes.tsx`, `src/app/profile/profile.tsx`, `src/app/features/featuresvalues/controllervalues.tsx`
Catch blocks that called `console.error(message)` without forwarding the caught error were updated to `console.error(message, err)`, ensuring the original error object appears in the browser console for easier debugging. A `console.error` call was also added to the `postValue` catch block in `controllervalues.tsx` which previously only updated UI state without logging.

### Debug code removed from production
**Files:** `src/app/features/featuresvalues/sensorvalue.tsx`, `src/app/features/featuresvalues/controllervalues.tsx`, `src/app/login/login.tsx`, `src/app/postlogin/postLogin.tsx`
- Removed three `console.log` calls that logged props, API responses, and navigation events.
- Removed `<div>{location.pathname}</div>` from PostLogin UI which was leaking internal routing information to users.

### Fixed Alert.onClose signature mismatch
**File:** `src/app/features/featuresvalues/controllervalues.tsx`
`handleSnackbarClose` had `reason: string` as a required second parameter, making it incompatible with `Alert.onClose` (which calls the handler with only one argument). Changed to `reason?: string` (optional) and switched the `setSnackBarState` call to the functional-update form to eliminate the stale-closure risk.

---

## Features

### Token from URL Fragment + Automatic Token Refresh

#### Token extracted from URL fragment
**File:** `src/app/postlogin/postLogin.tsx`
The access token delivered by the OAuth2 callback is now read from the URL **fragment** (`#token=<jwt>`) instead of the query string (`?token=<jwt>`). Fragment parameters never leave the browser (they are not sent to the server and do not appear in access logs), which reduces the token exposure window. Implementation: `new URLSearchParams(location.hash.slice(1)).get('token')`. When no token is found in the fragment the component now actively redirects to `/` instead of silently doing nothing.

#### Automatic access-token refresh
**File:** `src/services/common.ts`
`baseQueryWithForceLogout` (which immediately logged the user out on any 401) was replaced with `baseQueryWithReauth`, which implements a transparent refresh flow:

1. Every API response is inspected after the fetch completes.
2. **401** → calls `POST /api/token/refresh` via a dedicated `refreshBaseQuery` instance that sets `credentials: 'include'` so the browser automatically attaches the `refresh_token` HttpOnly cookie. The server returns a new access token as JSON `{ token }` and rotates the `refresh_token` cookie.
3. The new access token is persisted to `localStorage` via `setToken`, then the **original request is retried** transparently — the caller (component or hook) sees a successful response as if nothing happened.
4. If the refresh request itself fails (network error, 401, or unexpected response), the access token is removed and the user is redirected to `/`.
5. **403** → immediate logout without a refresh attempt.
6. **Concurrent 401s** are serialised via a module-level `Promise<boolean> | null` mutex (`refreshPromise`). All simultaneous failing requests share the same single refresh call; each retries the original request only after the refresh resolves.
