import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { getToken, removeToken } from '../auth/auth-utils';
import { BaseQueryApi, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    const token: string | null = getToken('token');
    if (token) {
      headers.set('Authorization', 'Bearer ' + token);
    }
    return headers;
  },
});

const baseQueryWithForceLogout: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args: string | FetchArgs, api: BaseQueryApi, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (result.error && (result.error.status === 401 || result.error.status === 403)) {
      console.log('baseQueryWithForceLogout - status 401 or 403 - logging out');
      //  1. Redirect user to LOGIN
      //  2. Reset authentication from localstorage/sessionstorage
      removeToken();
      window.location.href = '/';
    }
    return result;
  };

export const commonApi = createApi({
  reducerPath: 'api',
  // keepUnusedDataFor: specifies how long the data should be kept in the cache
  // after the subscriber reference count reaches zero.
  keepUnusedDataFor: 60, // invalidate cache after 60 seconds
  baseQuery: baseQueryWithForceLogout,
  tagTypes: ['Login', 'Homes', 'Rooms', 'Devices', 'SensorValues', 'ACValue', 'Profile'],
  endpoints: _ => ({}),
});
