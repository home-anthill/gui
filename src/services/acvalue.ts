import { commonApi } from './common';
import { ACValue, ACValueStates } from '../models/acvalue';

type ACValueRequest = ACValueStates

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
    updateACValue: builder.mutation<{ message: string }, { deviceId: string, acValueReq: ACValueRequest }>({
      query(data: { deviceId: string, acValueReq: ACValueRequest }) {
        const {deviceId, acValueReq} = data;
        return {
          url: `devices/${deviceId}/values`,
          method: 'POST',
          body: acValueReq
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
