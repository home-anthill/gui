import { commonApi } from './common';
import { Profile } from '../models/profile';

export interface ProfileTokenResponse {
  apiToken: string;
}

export const profileApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    getProfile: builder.query<Profile, void>({
      query: () => ({
        url: `profile`
      }),
      providesTags: [ 'Profile' ]
    }),
    newProfileToken: builder.mutation<ProfileTokenResponse, string>({
      query: (id: string) => ({
        url: `profiles/${id}/tokens`,
        method: 'POST',
        body: {}
      })
    })
  })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetProfileQuery,
  useNewProfileTokenMutation
} = profileApi
