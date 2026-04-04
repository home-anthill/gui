import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderHookWithStore } from '../test-store';
import { useRooms } from './useRooms';

describe('useRooms (MSW)', () => {
  it('adds a room via POST /api/homes/:homeId/rooms', async () => {
    const { result } = renderHookWithStore(() => useRooms());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const response = await result.current.addRoom('h1', {
      name: 'Bedroom',
      floor: 2,
    });
    expect((response as { data?: { message: string } }).data?.message).toBe(
      'created',
    );
  });

  it('deletes a room via DELETE /api/homes/:homeId/rooms/:roomId', async () => {
    const { result } = renderHookWithStore(() => useRooms());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const response = await result.current.deleteRoom('h1', 'r1');
    expect((response as { data?: { message: string } }).data?.message).toBe(
      'deleted',
    );
  });

  it('updates a room via PUT /api/homes/:homeId/rooms/:roomId', async () => {
    const { result } = renderHookWithStore(() => useRooms());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const response = await result.current.updateRoom('h1', 'r1', {
      name: 'Updated Room',
    });
    expect((response as { data?: { message: string } }).data?.message).toBe(
      'updated',
    );
  });
});
