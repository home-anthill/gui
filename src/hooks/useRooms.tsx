import { useCallback } from 'react'

import { useDeleteRoomByIdMutation, useAddRoomMutation, useUpdateRoomMutation } from '../services/rooms';
import { Room } from '../models/Home';

export function useRooms() {
  const [deleteRoomMutation, {isLoading: deleteRoomLoading}] = useDeleteRoomByIdMutation();
  const [addRoomMutation, {isLoading: addRoomLoading}] = useAddRoomMutation();
  const [updateRoomMutation, {isLoading: updateRoomLoading}] = useUpdateRoomMutation();

  const loading = deleteRoomLoading || addRoomLoading || updateRoomLoading;

  const deleteRoom = useCallback(
    (homeId: string, roomId: string) => deleteRoomMutation({homeId, roomId}),
    [deleteRoomMutation]
  );

  const addRoom = useCallback(
    (homeId: string, room: Partial<Room>) => addRoomMutation({homeId, room}),
    [addRoomMutation]
  );

  const updateRoom = useCallback(
    (homeId: string, roomId: string, room: Partial<Room>) => updateRoomMutation({homeId, roomId, room}),
    [updateRoomMutation]
  );

  return {
    loading,
    deleteRoom,
    addRoom,
    updateRoom
  }
}
