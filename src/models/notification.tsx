import { Device } from './device';

export interface Notification {
  id: string;
  sentAt: number;
  title: string;
  body: string;
  deviceCount: number;
  devices: Device[];
  provider: string;
  providerMessageId: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}
