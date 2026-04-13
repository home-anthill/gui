import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

import { getToken, removeToken, setToken } from '../auth/auth-utils';

const baseQuery = fetchBaseQuery({
  baseUrl: (import.meta.env.VITE_API_BASE_URL ?? '') + '/api',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    const token: string | null = getToken();
    if (token) {
      headers.set('Authorization', 'Bearer ' + token);
    }
    return headers;
  },
});

// Separate query used only for the refresh call — no auth header, sends cookies
const refreshBaseQuery = fetchBaseQuery({
  baseUrl: (import.meta.env.VITE_API_BASE_URL ?? '') + '/api',
  credentials: 'include',
});

// Serialize concurrent 401 responses so only one refresh request is made.
// Module-level so the single in-flight promise is shared across all RTK Query calls.
let refreshPromise: Promise<boolean> | null = null;

/** Reset the shared refresh promise. Call in test teardown to prevent cross-test leakage. */
export function _resetRefreshPromise(): void {
  refreshPromise = null;
}

async function refreshAccessToken(
  api: BaseQueryApi,
  extraOptions: Record<string, unknown>,
): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }
  async function doRefresh(): Promise<boolean> {
    try {
      const result = await refreshBaseQuery(
        { url: 'token/refresh', method: 'POST' },
        api,
        extraOptions,
      );
      if (result.data) {
        const { token } = result.data as { token: string };
        setToken(token);
        return true;
      }
      console.error('baseQueryWithReauth - token refresh failed - logging out');
      removeToken();
      window.location.href = '/';
      return false;
    } catch {
      console.error('baseQueryWithReauth - token refresh error - logging out');
      removeToken();
      window.location.href = '/';
      return false;
    }
  }
  refreshPromise = doRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 403) {
      console.error('baseQueryWithReauth - status 403 - logging out');
      removeToken();
      window.location.href = '/';
      return result;
    }

    if (result.error.status === 401) {
      const refreshed = await refreshAccessToken(
        api,
        extraOptions as Record<string, unknown>,
      );
      if (refreshed) {
        // Retry the original request with the refreshed access token
        result = await baseQuery(args, api, extraOptions);
      }
    }
  }

  return result;
};

export const commonApi = createApi({
  reducerPath: 'api',
  // keepUnusedDataFor: specifies how long the data should be kept in the cache
  // after the subscriber reference count reaches zero.
  keepUnusedDataFor: 60, // invalidate cache after 60 seconds
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Login',
    'Homes',
    'Rooms',
    'Devices',
    'Values',
    'Profile',
    'Online',
  ],
  endpoints: (_) => ({}),
});
