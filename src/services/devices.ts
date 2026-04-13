import { commonApi } from './common';

import {
  Device,
  DevicesResponse,
  HomeWithDevices,
  RoomWithDevices,
  AssignDeviceRequest,
} from '../models/device';
import { Home, Room } from '../models/home';

export const devicesApi = commonApi.injectEndpoints({
  endpoints: (builder) => ({
    getDevices: builder.query<DevicesResponse, { homes: Home[] }>({
      query(data: { homes: Home[] }) {
        return {
          url: `devices`,
        };
      },
      transformResponse: (
        response: Device[],
        _meta,
        arg: { homes: Home[] }
      ) => {
        const result: DevicesResponse = {
          unassignedDevices: [],
          homeDevices: [],
        };
        // 1) add unassigned devices to `result.unassignedDevices`
        result.unassignedDevices = getUnassignedDevices(arg.homes, response);
        // 2) add assigned devices with homes and rooms to `result.homeDevices`
        arg.homes.forEach((h: Home) => {
          const homeObj: HomeWithDevices = {
            ...h,
            rooms: [],
          };
          const roomsObjs: RoomWithDevices[] = [];
          if (h.rooms) {
            h.rooms.forEach((room: Room) => {
              // if this room has devices, otherwise skip it
              if (room?.devices?.length > 0) {
                const roomObj: RoomWithDevices = {
                  ...room,
                  devices: [],
                };
                // deduplicate device IDs, resolve to full Device objects, drop missing refs
                roomObj.devices = [...new Set(room.devices)].reduce<Device[]>(
                  (acc, deviceId) => {
                    const device = response.find((d) => d && d.id === deviceId);
                    if (device) acc.push(device);
                    return acc;
                  },
                  [],
                );
                // add this room to the list of rooms of the current home
                roomsObjs.push(roomObj);
              }
            });
            // if this home has rooms (added in the loop above), otherwise skip it
            if (roomsObjs.length > 0) {
              homeObj.rooms = roomsObjs;
              result.homeDevices.push(homeObj);
            }
          }
        });
        // 3) result object contains `unassignedDevices` and`homeDevices`
        return result;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.unassignedDevices.map(({ id }) => ({ type: 'Devices' as const, id })),
              ...result.homeDevices.flatMap(h =>
                h.rooms.flatMap(r =>
                  r.devices.map(({ id }) => ({ type: 'Devices' as const, id }))
                )
              ),
              { type: 'Devices' as const, id: 'LIST' },
            ]
          : [{ type: 'Devices' as const, id: 'LIST' }],
    }),
    assignDevice: builder.mutation<{ message: string }, AssignDeviceRequest>({
      query(data: AssignDeviceRequest) {
        const { deviceId, ...body } = data;
        return {
          url: `devices/${deviceId}`,
          method: 'PUT',
          body: body,
        };
      },
      invalidatesTags: [{ type: 'Devices', id: 'LIST' }, { type: 'Homes', id: 'LIST' }],
    }),
    deleteDevice: builder.mutation<{ message: string }, { deviceId: string }>({
      query(data: { deviceId: string }) {
        const { deviceId } = data;
        return {
          url: `devices/${deviceId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Devices', id: arg.deviceId },
        { type: 'Devices', id: 'LIST' },
      ],
    }),
  }),
});

function getUnassignedDevices(homes: Home[], devices: Device[]): Device[] {
  const assignedIds = new Set(
    homes.flatMap((home) => (home?.rooms ?? []).flatMap((room) => room?.devices ?? [])),
  );
  return devices.filter((device) => device && !assignedIds.has(device.id));
}

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetDevicesQuery,
  useAssignDeviceMutation,
  useDeleteDeviceMutation,
} = devicesApi;
