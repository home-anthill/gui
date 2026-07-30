# Changelog

## 5.0.0

### Features

- add device feature spec support
- add online feature notification silence toggle
- add notification silence toggles for motion and thermostat mode alarms
- add notifications history
- add route-level dynamic imports to code-split pages and reduce the production entry bundle
- add route-level error fallback and one-time Vite preload reload recovery for stale app assets
- Added thermostat `mode` sensor feature
- Upgrade from `nginx:1-alpine3.23` to `nginx:1-alpine3.24`, it requires changes to `deployer` project
- Upgrade to NX 23 and Vite 5 + other deps updates

### Tests

- improve test coverage
- add coverage for asset-load error detection and preload reload handling


## 4.0.0

### Features

- Rebuilt the app on Mantine 9, replacing Material UI components, theme, icons, and notifications.
- Unified device list, settings, and features into `/devices/:id` with inline settings and delete modals.
- Added focused device feature components for sensors, controllers, and online presence.
- Added responsive navigation with desktop links and a mobile drawer.
- Centralised routing in `src/app/routes.tsx` with React Router 7 nested layouts.
- Added scoped SCSS modules across pages and components.
- Kept online feature cards visible with an `Unknown` fallback when status data is unavailable.
- Read OAuth callback tokens from the URL fragment instead of the query string.
- Added automatic access-token refresh on 401 responses with retry and concurrent-refresh serialisation.
- Added server-side logout via `POST /api/oauth/logout`.
- Added a profile token visibility control with a "Hide token" action.
- Added a top-level error boundary with a reload fallback.
- Added loading and error states to the Homes page.
- Added `homesLoading` to `useHomes` for initial page-load state.
- Allowed `useValues` to accept an optional device and skip requests safely.
- Added stricter TypeScript checks with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- Updated `tsconfig.json` for Vite and React with `moduleResolution: "bundler"`, `target: "ES2022"`, and `isolatedModules`.
- Added per-device cache tags for device queries and value mutations.
- Added `HomesActionsContext` for shared home and room actions.

### Security

- Disabled Redux DevTools outside development builds.
- Added name and location validation to reduce stored-XSS risk.
- Moved OAuth token delivery to URL fragments to avoid server log exposure.
- Cleared local authentication state after failed refresh or logout flows.
- Removed plaintext regenerated API tokens from state and DOM when hidden.

### Bug Fixes

- Fixed controller feature send-state handling by passing `setValuesLoading` instead of hardcoded `false`.
- Fixed missing online data causing online cards to disappear.
- Fixed Homes page mutation failures with try/catch handling and visible feedback.
- Fixed `LocalStorageMock.getItem()` for `noUncheckedIndexedAccess`.
- Fixed optional-prop handling for `exactOptionalPropertyTypes`.
- Fixed required `name` fields missing from device test fixtures.
- Fixed unconditional hook usage by using `skipToken` for absent devices.
- Fixed unsafe empty-object defaults in `useProfile` and `useOnline`.
- Fixed unsafe device hook defaults with a complete `DevicesResponse` shape.
- Fixed device-detail empty-state flashes by deriving feature values synchronously.

### Tests

- Migrated test providers from MUI to Mantine.
- Added a `window.matchMedia` mock for Mantine in jsdom.
- Added device detail tests for loading, errors, details, navigation, modals, and deletion.
- Added sensor feature tests for empty state, headings, formatting, and unit handling.
- Added online feature tests for empty state, headings, values, and multiple cards.
- Added controller feature tests for controls, callbacks, disabled state, and last-sent data.
- Added device list and device card tests for states, navigation, and handlers.
- Added Homes and HomeAccordion tests for states, modals, actions, and context.
- Added navbar, error boundary, and not-found page tests.
- Added profile logout tests for server logout and local token removal.

### Chores

- Removed obsolete `src/app/devicesettings/`, `src/app/edithome/`, `src/app/features/`, and `src/app/homes/homecard/`.
- Replaced `HomeCard` with `HomeAccordion`.
- Removed the `/main` route prefix.
- Consolidated global styles and variables in `src/styles/global.scss` and `src/styles/_variables.scss`.
- Removed inline style objects and MUI `sx` props.
- Removed unused decorator, import-helper, and redundant lib-check TypeScript options.
- Removed unnecessary `useCallback` wrappers from hooks.

### Idiomatic Improvements

- Replaced feature-value effect syncing with `useMemo` and local controller overrides.
- Memoised Homes action context values.
- Wrapped Homes callbacks in `useCallback`.
- Wrapped `DeviceCard` with `React.memo`.
- Used `useRef` as a one-shot guard for post-login token handling under React StrictMode.
- Displayed React Hook Form validation errors directly in Homes form inputs.
- Used conditional spreads for exact optional properties.
- Used explicit query skip values where optional booleans were accepted.
- Kept profile logout local cleanup independent of server request success.
