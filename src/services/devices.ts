import { commonApi } from './common';
import { Device, Feature } from '../models/device';
import { Home, Room } from '../models/home';

export interface DevicesResponse {
  unassignedDevices: Device[];
  homeDevices: HomeWithDevices[];
}

export interface HomeWithDevices extends Home {
  rooms: RoomSplitDevices[]
}

export interface RoomSplitDevices extends Room {
  controllerDevices: Device[];
  sensorDevices: Device[];
}

export const devicesApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    getDevices: builder.query<DevicesResponse, { homes: Home[] }>({
      query(data: { homes: Home[] }) {
        return {
          url: `devices`
        }
      },
      transformResponse: (response: Device[], _meta, arg: { homes: Home[] }) => {
        const result: DevicesResponse = {
          unassignedDevices: [],
          homeDevices: []
        }
        // 1) add unassigned devices to `result.unassignedDevices`
        result.unassignedDevices = getUnassignedDevices(arg.homes, response);
        // 2) add assigned devices with homes and rooms to `result.homeDevices`
        arg.homes.forEach((home: Home) => {
          const homeObj: HomeWithDevices = Object.assign({}, home) as HomeWithDevices;
          const roomsObjs: RoomSplitDevices[] = [];
          homeObj.rooms.forEach((room: Room) => {
            // if this room has devices, otherwise skip it
            if (room?.devices?.length > 0) {
              const roomObj: RoomSplitDevices = Object.assign({}, room) as RoomSplitDevices;
              // get all devices in this room removing duplicates
              // and mapping these as device object instead of an id string
              const roomDevices: Device[] = roomObj.devices
                // remove duplicated
                .filter((v1: string, i: number, array: string[]) => array.findIndex((v2: string) => (v2 === v1)) === i)
                // map device id to its full device object
                .map((deviceId: string) => response.find((device: Device) => device && device.id === deviceId))
                // remove undefined devices (it happens when the find above fails.
                // the reason is that you have a broken db with bad references across collections
                .filter((device: Device | undefined) => device) as Device[];
              // split those devices into 2 different arrays:
              // - controllers (devices able to receive commands)
              // - sensors (read-only devices)
              roomObj.controllerDevices = getControllers(roomDevices);
              roomObj.sensorDevices = getSensors(roomDevices);
              // remove the list of device ids in string format, because above we added full objects
              roomObj.devices = [];
              // add this room to the list of rooms of the current home
              roomsObjs.push(roomObj);
            }
          });
          // if this home has rooms (added in the loop above), otherwise skip it
          if (roomsObjs.length > 0) {
            homeObj.rooms = roomsObjs;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            result.homeDevices.push(homeObj);
          }
        });
        // 3) result object contains `unassignedDevices`,
        //    `homeDevices` (`controllerDevices` and `sensorDevices`)
        // console.log('result: ', result);
        return result;
      },
      // FIXME every element of the list should be tagged one by one, not like this
      providesTags: ['Devices']
    }),
    deleteDevice: builder.mutation<{ message: string }, { deviceId: string }>({
      query(data: { deviceId: string }) {
        const {deviceId} = data;
        return {
          url: `devices/${deviceId}`,
          method: 'DELETE'
        };
      },
      invalidatesTags: ['Devices']
    })
  })
})

function getUnassignedDevices(homes: Home[], devices: Device[]): Device[] {
  const rooms: Room[] = homes
    .filter((home: Home) => home?.rooms?.length > 0)
    .map((home: Home) => home.rooms)
    .flat();
  const devicesIds: string[] = rooms
    .filter((room: Room) => room?.devices?.length > 0)
    .map((room: Room) => room.devices)
    .flat();
  return devices
    .filter((device: Device) => device && !devicesIds.includes(device.id));
}

function getControllers(devices: Device[]): Device[] {
  // if a device has a controller feature, it's a controller and it cannot have any sensor feature!
  return devices.filter((device: Device) => device?.features?.find((feature: Feature) => feature.type === 'controller'));
}

function getSensors(devices: Device[]): Device[] {
  // is a device has only sensor feature, it's a sensor
  return devices.filter((device: Device) => device?.features?.every((feature: Feature) => feature.type === 'sensor'));
}


// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetDevicesQuery,
  useDeleteDeviceMutation
} = devicesApi
