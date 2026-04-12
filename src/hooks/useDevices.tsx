import { useCallback } from 'react';

import { Home } from '../models/home';
import { useGetHomesQuery } from '../services/homes';
import {
  useAssignDeviceMutation,
  useDeleteDeviceMutation,
  useGetDevicesQuery,
} from '../services/devices';

export function useDevices() {
  const {
    data: homes = [] as Home[],
    isLoading: homesLoading,
    error: homesError,
  } = useGetHomesQuery();
  const {
    data: homeDevices = { unassignedDevices: [], homeDevices: [] },
    isLoading: devicesLoading,
    error: devicesError,
  } = useGetDevicesQuery({ homes });
  const [assignDeviceMutation] = useAssignDeviceMutation();
  const [deleteDeviceMutation, { isLoading: deleteDeviceLoading }] =
    useDeleteDeviceMutation();

  const loading = homesLoading || devicesLoading || deleteDeviceLoading;
  const error = homesError || devicesError;

  const assignDeviceHomeRoom = useCallback(
    (deviceId: string, name: string, homeId: string, roomId: string) =>
      assignDeviceMutation({ deviceId, name, homeId, roomId }),
    [assignDeviceMutation],
  );

  const deleteDevice = useCallback(
    (deviceId: string) => deleteDeviceMutation({ deviceId }),
    [deleteDeviceMutation],
  );

  return {
    homeDevices,
    loading,
    error,
    assignDeviceHomeRoom,
    deleteDevice,
  };
}
