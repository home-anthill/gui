import { commonApi } from './common';
import { Online } from '../models/online';

export const onlineApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    getOnline: builder.query<Online, string>({
      query(id: string) {
        return {
          url: `online/${id}`
        }
      },
      providesTags: ['Online']
    })
  })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetOnlineQuery,
} = onlineApi
