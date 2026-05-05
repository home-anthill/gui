import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderHookWithStore } from '../test-store';
import { useOnline } from './useOnline';
import { mockOnlineNow } from '../test-fixtures';

describe('useOnline (MSW)', () => {
  it('fetches online status for a device from GET /api/online/:id', async () => {
    const { result } = renderHookWithStore(() => useOnline('d1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.online?.modifiedAt).toBe(mockOnlineNow.modifiedAt);
    expect(result.current.online?.currentTime).toBe(mockOnlineNow.currentTime);
  });

  it('returns onlineError when GET /api/online/:id fails', async () => {
    const { server } = await import('../mocks/server');
    const { http, HttpResponse } = await import('msw');
    server.use(
      http.get('/api/online/:id', () =>
        HttpResponse.json({ error: 'Not Found' }, { status: 404 }),
      ),
    );

    const { result } = renderHookWithStore(() => useOnline('d1'));
    await waitFor(() => expect(result.current.onlineError).toBeDefined());
  });
});
