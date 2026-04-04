import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderHookWithStore } from '../test-store';
import { useHomes } from './useHomes';
import { mockHome } from '../test-fixtures';

describe('useHomes (MSW)', () => {
  it('fetches the list of homes from GET /api/homes', async () => {
    const { result } = renderHookWithStore(() => useHomes());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.homes).toHaveLength(1);
    expect(result.current.homes[0].id).toBe(mockHome.id);
    expect(result.current.homes[0].name).toBe(mockHome.name);
  });

  it('adds a home via POST /api/homes', async () => {
    const { result } = renderHookWithStore(() => useHomes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response: Awaited<ReturnType<typeof result.current.addHome>>;
    await waitFor(async () => {
      response = await result.current.addHome('New Home', 'Berlin');
      expect(response).toBeDefined();
    });
    expect((response! as { data?: unknown }).data).toBeDefined();
  });

  it('deletes a home via DELETE /api/homes/:id', async () => {
    const { result } = renderHookWithStore(() => useHomes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const response = await result.current.deleteHome('h1');
    expect((response as { data?: { message: string } }).data?.message).toBe(
      'deleted',
    );
  });

  it('updates a home via PUT /api/homes/:id', async () => {
    const { result } = renderHookWithStore(() => useHomes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const response = await result.current.updateHome('h1', 'Updated', 'Tokyo');
    expect((response as { data?: { message: string } }).data?.message).toBe(
      'updated',
    );
  });

  it('returns homesError when GET /api/homes fails', async () => {
    const { server } = await import('../mocks/server');
    const { http, HttpResponse } = await import('msw');
    server.use(
      http.get('/api/homes', () =>
        HttpResponse.json({ error: 'Server Error' }, { status: 500 }),
      ),
    );

    const { result } = renderHookWithStore(() => useHomes());
    await waitFor(() => expect(result.current.homesError).toBeDefined());
    expect(result.current.homes).toHaveLength(0);
  });
});
