import { useCallback } from 'react';

import { Home} from '../models/home';
import { useGetHomesQuery } from '../services/homes';
import { useAssignDeviceMutation, useDeleteDeviceMutation, useGetDevicesQuery } from '../services/devices';
import { DevicesResponse } from '../models/device';

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
  const [assignDeviceMutation] = useAssignDeviceMutation();
  const [deleteDeviceMutation, {isLoading: deleteDeviceLoading}] = useDeleteDeviceMutation();

  const loading = homesLoading || devicesLoading || deleteDeviceLoading;
  const error = homesError || devicesError;

  const assignDeviceHomeRoom = useCallback(
    (deviceId: string, homeId: string, roomId: string) => assignDeviceMutation({ deviceId, homeId, roomId }),
    [assignDeviceMutation]
  );

  const deleteDevice = useCallback(
    (deviceId: string) => deleteDeviceMutation({deviceId}),
    [deleteDeviceMutation]
  );

  return {
    homeDevices,
    loading,
    error,
    assignDeviceHomeRoom,
    deleteDevice
  }
}
