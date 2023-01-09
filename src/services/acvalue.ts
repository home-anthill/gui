import { commonApi } from './common';
import { ACValue } from '../models/acvalue';

export const acValueApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    getACValue: builder.query<ACValue, string>({
      query(deviceId: string) {
        return {
          url: `devices/${deviceId}/values`
        }
      },
      providesTags: ['ACValue']
    }),
    updateACValue: builder.mutation<{ message: string }, { deviceId: string, acValue: ACValue }>({
      query(data: { deviceId: string, acValue: ACValue }) {
        const {deviceId, acValue} = data;
        return {
          url: `devices/${deviceId}/values`,
          method: 'POST',
          body: acValue
        }
      },
      invalidatesTags: ['ACValue']
    })
  })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useLazyGetACValueQuery,
  useUpdateACValueMutation
} = acValueApi
