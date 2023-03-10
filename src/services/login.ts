import { commonApi } from './common';
import { LoginResponse } from '../models/auth';

export const loginApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    getLoginUrl: builder.query<LoginResponse, void>({
      query: () => ({
        url: `login`
      })
    })
  })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetLoginUrlQuery
} = loginApi
