import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderHookWithStore } from '../test-store';
import { useDevices } from './useDevices';
import { mockDevice, mockDevice2 } from '../test-fixtures';

describe('useDevices (MSW)', () => {
  it('fetches and organizes devices by home and room', async () => {
    const { result } = renderHookWithStore(() => useDevices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // mockHome has room r1 with device 'd1' (mockDevice)
    // mockDevice2 ('d2') is unassigned
    expect(result.current.homeDevices.homeDevices).toHaveLength(1);
    expect(result.current.homeDevices.homeDevices[0].id).toBe('h1');
    const room = result.current.homeDevices.homeDevices[0].rooms[0];
    expect(room.devices).toHaveLength(1);
    expect(room.devices[0].id).toBe(mockDevice.id);
  });

  it('puts unassigned devices (not referenced by any room) in unassignedDevices', async () => {
    const { result } = renderHookWithStore(() => useDevices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.homeDevices.unassignedDevices).toHaveLength(1);
    expect(result.current.homeDevices.unassignedDevices[0].id).toBe(
      mockDevice2.id,
    );
  });

  it('assigns a device to a home/room via PUT /api/devices/:deviceId', async () => {
    const { result } = renderHookWithStore(() => useDevices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const response = await result.current.assignDeviceHomeRoom(
      'd2',
      'h1',
      'r1',
    );
    expect((response as { data?: { message: string } }).data?.message).toBe(
      'assigned',
    );
  });

  it('deletes a device via DELETE /api/devices/:deviceId', async () => {
    const { result } = renderHookWithStore(() => useDevices());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const response = await result.current.deleteDevice('d1');
    expect((response as { data?: { message: string } }).data?.message).toBe(
      'deleted',
    );
  });
});
