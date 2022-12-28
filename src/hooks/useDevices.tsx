import { useCallback } from 'react';

import { Home } from '../models/home';
import { useGetHomesQuery } from '../services/homes';
import { DevicesResponse, useDeleteDeviceMutation, useGetDevicesQuery } from '../services/devices';

export function useDevices() {
  const {
    data: homes = [] as Home[],
    isLoading: homesLoading,
    error: homesError
  } = useGetHomesQuery();
  const {
    data: homeDevices = {} as DevicesResponse,
    isLoading: devicesLoading,
    error: devicesError
  } = useGetDevicesQuery({homes});
  const [deleteDeviceMutation, {isLoading: deleteDeviceLoading}] = useDeleteDeviceMutation();

  const loading = homesLoading || devicesLoading || deleteDeviceLoading;
  const error = homesError || devicesError;

  const deleteDevice = useCallback(
    (deviceId: string, homeId: string, roomId: string) => deleteDeviceMutation({deviceId, homeId, roomId}),
    [deleteDeviceMutation]
  );

  return {
    homeDevices,
    loading,
    error,
    deleteDevice
  }
}
