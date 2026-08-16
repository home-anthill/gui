import { Home, Room } from './models/home';
import { Device, HomeWithDevices, RoomWithDevices } from './models/device';
import { DeviceWithValuesResponse, FeatureValue } from './models/value';
import { Profile } from './models/profile';
import { Online } from './models/online';
import { NotificationsResponse } from './models/notification';

// ─── Homes ───────────────────────────────────────────────────────────────────

export const mockRoom: Room = {
  id: 'r1',
  name: 'Living Room',
  floor: 1,
  devices: ['d1'],
  createdAt: new Date('2024-01-01'),
  modifiedAt: new Date('2024-01-02'),
};

export const mockHome: Home = {
  id: 'h1',
  name: 'My Home',
  location: 'London',
  createdAt: new Date('2024-01-01'),
  modifiedAt: new Date('2024-01-02'),
  rooms: [mockRoom],
};

export const mockHomeNoRooms: Home = {
  id: 'h2',
  name: 'Empty Home',
  location: 'Paris',
  createdAt: new Date('2024-01-01'),
  modifiedAt: new Date('2024-01-02'),
  rooms: [],
};

// ─── Devices ─────────────────────────────────────────────────────────────────

export const mockDevice: Device = {
  id: 'd1',
  name: '',
  uuid: 'uuid-d1',
  mac: 'AA:BB:CC:DD:EE:FF',
  manufacturer: 'Acme',
  model: 'Sensor-X',
  createdAt: '2024-01-01T00:00:00Z',
  modifiedAt: '2024-01-02T00:00:00Z',
  features: [
    {
      uuid: 'f1',
      name: 'temperature',
      type: 'sensor',
      unit: '°C',
      order: 1,
      enable: true,
      spec: { format: 'float', step: 0.01 },
    },
  ],
};

export const mockDevice2: Device = {
  id: 'd2',
  name: '',
  uuid: 'uuid-d2',
  mac: '11:22:33:44:55:66',
  manufacturer: 'BrandX',
  model: 'Controller-Y',
  createdAt: '2024-01-01T00:00:00Z',
  modifiedAt: '2024-01-02T00:00:00Z',
  features: [],
};

export const mockRoomWithDevices: RoomWithDevices = {
  id: 'r1',
  name: 'Living Room',
  floor: 1,
  createdAt: new Date('2024-01-01'),
  modifiedAt: new Date('2024-01-02'),
  devices: [mockDevice],
};

export const mockHomeWithDevices: HomeWithDevices = {
  id: 'h1',
  name: 'My Home',
  location: 'London',
  createdAt: new Date('2024-01-01'),
  modifiedAt: new Date('2024-01-02'),
  rooms: [mockRoomWithDevices],
};

// ─── Feature values ──────────────────────────────────────────────────────────

export const makeFeatureValue = (
  overrides: Partial<FeatureValue> = {},
): FeatureValue => ({
  featureUuid: 'fv1',
  name: 'temperature',
  type: 'sensor',
  unit: '°C',
  order: 1,
  enable: true,
  spec: { format: 'float', step: 0.01 },
  value: 22.5,
  createdAt: 1705318245000,
  modifiedAt: 1705318245000,
  ...overrides,
});

export const mockDeviceWithValues: DeviceWithValuesResponse = {
  id: 'd1',
  name: '',
  uuid: 'uuid-d1',
  mac: 'AA:BB:CC:DD:EE:FF',
  manufacturer: 'Acme',
  model: 'Sensor-X',
  createdAt: '2024-01-01T00:00:00Z',
  modifiedAt: '2024-06-01T12:00:00Z',
  features: [
    makeFeatureValue({
      featureUuid: 'fv1',
      name: 'temperature',
      type: 'sensor',
      value: 22.5,
      unit: '°C',
    }),
  ],
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const mockProfile: Profile = {
  id: 'p1',
  github: {
    login: 'johndoe',
    name: 'John Doe',
    email: 'john@example.com',
    avatarURL: 'https://example.com/avatar.png',
  },
};

// ─── Online ───────────────────────────────────────────────────────────────────

export const mockOnlineNow: Online = {
  deviceId: 'd1',
  featureUuid: 'online-1',
  status: 'online',
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  currentTime: new Date().toISOString(),
};

export const mockOnlineOffline: Online = {
  deviceId: 'd1',
  featureUuid: 'online-1',
  status: 'offline',
  createdAt: '2026-01-05T21:43:41.082+02:00',
  modifiedAt: '2026-04-05T21:48:14.113+02:00',
  currentTime: new Date().toISOString(),
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const mockNotificationsResponse: NotificationsResponse = {
  notifications: [
    {
      id: 'notification-new',
      sentAt: 1705318245000,
      title: 'home anthill',
      body: 'Device is offline',
      deviceCount: 1,
      devices: [{ ...mockDevice, name: 'Kitchen sensor' }],
      provider: 'fcm',
      providerMessageId: 'projects/home-anthill/messages/message-new',
    },
    {
      id: 'notification-old',
      sentAt: 1705318000000,
      title: 'home anthill',
      body: '2 devices are offline',
      deviceCount: 2,
      devices: [
        { ...mockDevice, name: 'Kitchen sensor' },
        { ...mockDevice2, name: 'Hall thermostat' },
      ],
      provider: 'fcm',
      providerMessageId: 'projects/home-anthill/messages/message-old',
    },
  ],
};
