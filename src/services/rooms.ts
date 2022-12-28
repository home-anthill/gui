import { commonApi } from './common';
import { Room } from '../models/home';

export const roomsApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    deleteRoomById: builder.mutation<{ message: string }, { homeId: string, roomId: string }>({
      query(data: { homeId: string, roomId: string }) {
        const {homeId, roomId} = data;
        return {
          url: `homes/${homeId}/rooms/${roomId}`,
          method: 'DELETE'
        }
      },
      invalidatesTags: [{ type: 'Homes', id: 'LIST' }]
    }),
    addRoom: builder.mutation<{message: string}, { room: Partial<Room>, homeId: string }>({
      query(data: { room: Partial<Room>, homeId: string }) {
        const { room, homeId } = data;
        return {
          url: `homes/${homeId}/rooms`,
          method: 'POST',
          body: room
        }
      },
      invalidatesTags: [{ type: 'Homes', id: 'LIST' }]
    }),
    updateRoom: builder.mutation<{message: string}, { room: Partial<Room>, homeId: string, roomId: string }>({
      query(data: { room: Partial<Room>, homeId: string, roomId: string }) {
        const { room, homeId, roomId } = data;
        return {
          url: `homes/${homeId}/rooms/${roomId}`,
          method: 'PUT',
          body: room
        }
      },
      invalidatesTags: [{ type: 'Homes', id: 'LIST' }]
    })
  })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useDeleteRoomByIdMutation,
  useAddRoomMutation,
  useUpdateRoomMutation
} = roomsApi
