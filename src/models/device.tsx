import { Home, Room } from './home';

export interface Device {
  id: string;
  uuid: string;
  mac: string;
  manufacturer: string;
  model: string;
  createdAt: string;
  modifiedAt: string;
  features: Feature[];
}

export interface Feature {
  uuid: string;
  name: string;
  type: string;
  unit: string;
  order: number;
  enable: boolean;
}

export interface HomeWithDevices extends Omit<Home, "rooms"> {
  rooms: RoomWithDevices[]
}

export interface RoomWithDevices extends Omit<Room, "devices"> {
  devices: Device[];
}

// *****************************************************************
// ********** requests, responses and utility interfaces ***********
// *****************************************************************
export interface AssignDeviceRequest {
  deviceId: string;
  homeId: string;
  roomId: string;
}

export interface DevicesResponse {
  unassignedDevices: Device[];
  homeDevices: HomeWithDevices[];
}
