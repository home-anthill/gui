import { Home, Room } from './home';

export type Format = 'bool' | 'int' | 'float' | 'list';

export interface Device {
  id: string;
  name: string;
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
  spec: Spec;
  notificationSilenced?: boolean;
}

export interface Spec {
  format: Format;
  min?: number;
  max?: number;
  step?: number;
  list?: SpecListItem[];
}

export interface SpecListItem {
  value: number;
  text: string;
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
  name: string;
  homeId: string;
  roomId: string;
}

export interface UpdateFeatureNotificationRequest {
  deviceId: string;
  featureUuid: string;
  notificationSilenced: boolean;
}

export interface DevicesResponse {
  unassignedDevices: Device[];
  homeDevices: HomeWithDevices[];
}
