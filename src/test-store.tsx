import { ReactNode } from 'react';
import { renderHook, RenderHookOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { commonApi } from './services/common';

export function makeTestStore() {
  return configureStore({
    reducer: { [commonApi.reducerPath]: commonApi.reducer },
    middleware: (getDefault) => getDefault().concat(commonApi.middleware),
  });
}

export type TestStore = ReturnType<typeof makeTestStore>;

/**
 * Renders a hook inside a fresh Redux store (with RTK Query middleware).
 * A new store is created per call so tests are fully isolated.
 */
export function renderHookWithStore<T>(
  callback: () => T,
  options?: Omit<RenderHookOptions<unknown>, 'wrapper'>,
) {
  const store = makeTestStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, ...renderHook(callback, { wrapper, ...options }) };
}
