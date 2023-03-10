import { Home, Room } from './home';

export interface Device {
  id: string;
  uuid: string;
  mac: string;
  manufacturer: string;
  model: string;
  createdAt: Date;
  modifiedAt: Date;
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

// *****************************************************************
// ********** requests, responses and utility interfaces ***********
// *****************************************************************
export interface HomeWithDevices extends Home {
  rooms: RoomSplitDevices[]
}

export interface RoomSplitDevices extends Room {
  controllerDevices: Device[];
  sensorDevices: Device[];
}

export interface AssignDeviceRequest {
  deviceId: string;
  homeId: string;
  roomId: string;
}

export interface DevicesResponse {
  unassignedDevices: Device[];
  homeDevices: HomeWithDevices[];
}
