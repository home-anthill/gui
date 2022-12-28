import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { getToken } from '../auth/auth-utils';

export const commonApi = createApi({
  reducerPath: 'api',
  // keepUnusedDataFor: specifies how long the data should be kept in the cache
  // after the subscriber reference count reaches zero.
  keepUnusedDataFor: 60, // invalidate cache after 60 seconds
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: headers => {
      headers.set('Content-Type', 'application/json');
      const token: string | null = getToken('token');
      if (token) {
        headers.set('Authorization', 'Bearer ' + token);
      }
      return headers;
    },
    // validateStatus:(response, body) => {},
    // fetchFn:
  }),
  tagTypes: ['Login', 'Homes', 'Rooms', 'Devices', 'SensorValues', 'ACValue', 'Profile'],
  endpoints: _ => ({}),
});
