export type OnlineState = 'online' | 'offline' | 'unknown';

export interface Online {
  deviceId: string;
  featureUuid: string;
  status: OnlineState;
  createdAt: string | null;
  modifiedAt: string | null;
  currentTime: string;
}
