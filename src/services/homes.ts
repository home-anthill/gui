import { commonApi } from './common';
import { Home } from '../models/home';

interface NewHomeRequest {
  name: string;
  location: string;
  rooms: [];
}

interface UpdateHomeRequest {
  id: string;
  name: string;
  location: string;
}

export const homesApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    getHomes: builder.query<Home[], void>({
      query: () => ({
        url: `homes`
      }),
      providesTags: (result) =>
        result ? [
          ...result.map(({ id }) => ({ type: 'Homes' as const, id })),
          { type: 'Homes', id: 'LIST' },
        ] : [{ type: 'Homes', id: 'LIST' }],
    }),
    deleteHomeById: builder.mutation<{ message: string }, string>({
      query: (id: string) => ({
        url: `homes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Homes', id: 'LIST' }]
    }),
    addHome: builder.mutation<Home, NewHomeRequest>({
      query: (body: NewHomeRequest) => ({
        url: `homes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Homes', id: 'LIST' }]
    }),
    updateHome: builder.mutation<{ message: string }, UpdateHomeRequest>({
      query(data: UpdateHomeRequest) {
        const { id, ...body } = data
        return {
          url: `homes/${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: [{ type: 'Homes', id: 'LIST' }]
    })
  })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetHomesQuery,
  useLazyGetHomesQuery,
  useDeleteHomeByIdMutation,
  useAddHomeMutation,
  useUpdateHomeMutation
} = homesApi
