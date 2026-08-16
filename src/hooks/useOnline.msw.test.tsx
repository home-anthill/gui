import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderHookWithStore } from '../test-store';
import { useOnline } from './useOnline';
import { mockOnlineNow } from '../test-fixtures';

describe('useOnline (MSW)', () => {
  it('selects a device status from GET /api/online bulk response', async () => {
    const { result } = renderHookWithStore(() => useOnline('d1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.online?.modifiedAt).toBe(mockOnlineNow.modifiedAt);
    expect(result.current.online?.currentTime).toBe(mockOnlineNow.currentTime);
  });

  it('returns onlineError when GET /api/online bulk request fails', async () => {
    const { server } = await import('../mocks/server');
    const { http, HttpResponse } = await import('msw');
    server.use(
      http.get('/api/online', () =>
        HttpResponse.json({ error: 'Not Found' }, { status: 404 }),
      ),
    );

    const { result } = renderHookWithStore(() => useOnline('d1'));
    await waitFor(() => expect(result.current.onlineError).toBeDefined());
  });

  it('shares one bulk request between device subscribers', async () => {
    const { server } = await import('../mocks/server');
    const { http, HttpResponse } = await import('msw');
    let requests = 0;
    server.use(
      http.get('/api/online', () => {
        requests += 1;
        return HttpResponse.json([mockOnlineNow]);
      }),
    );

    const first = renderHookWithStore(() => ({
      first: useOnline('d1'),
      second: useOnline('d2'),
    }));
    await waitFor(() => expect(first.result.current.first.loading).toBe(false));

    expect(requests).toBe(1);
    expect(first.result.current.first.online?.status).toBe('online');
    expect(first.result.current.second.online).toBeUndefined();
  });
});
