import { commonApi } from './common';
import { Online } from '../models/online';

export const onlineApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    getOnlineStatuses: builder.query<Online[], void>({
      query: () => ({ url: 'online' }),
      providesTags: result =>
        result
          ? [
              ...result.map(({ deviceId }) => ({
                type: 'Online' as const,
                id: deviceId,
              })),
              { type: 'Online' as const, id: 'LIST' },
            ]
          : [{ type: 'Online' as const, id: 'LIST' }],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetOnlineStatusesQuery } = onlineApi;
