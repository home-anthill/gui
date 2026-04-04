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
                // get all devices in this room removing duplicates
                // and mapping these as device object instead of an id string
                // and replace the array of device IDs with full device objects
                roomObj.devices = room.devices
                  // remove duplicated
                  .filter(
                    (v1: string, i: number, array: string[]) =>
                      array.findIndex((v2: string) => v2 === v1) === i
                  )
                  // map device id to its full device object
                  .map((deviceId: string) =>
                    response.find(
                      (device: Device) => device && device.id === deviceId
                    )
                  )
                  // remove undefined devices (it happens when the find above fails.
                  // the reason is that you have a broken db with bad references across collections
                  .filter((device: Device | undefined) => device) as Device[];
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
  const rooms: Room[] = homes
    .filter((home: Home) => home?.rooms?.length > 0)
    .map((home: Home) => home.rooms)
    .flat();
  const devicesIds: string[] = rooms
    .filter((room: Room) => room?.devices?.length > 0)
    .map((room: Room) => room.devices)
    .flat();
  return devices.filter(
    (device: Device) => device && !devicesIds.includes(device.id)
  );
}

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetDevicesQuery,
  useAssignDeviceMutation,
  useDeleteDeviceMutation,
} = devicesApi;
