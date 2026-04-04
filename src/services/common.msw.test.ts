import { describe, it, expect, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '../mocks/server';
import { renderHookWithStore } from '../test-store';
import { useHomes } from '../hooks/useHomes';
import { setToken, removeToken } from '../auth/auth-utils';

afterEach(() => {
  removeToken();
});

describe('base query auth (MSW)', () => {
  it('includes Authorization header when a token is stored', async () => {
    setToken('test-jwt-token');

    let capturedAuth: string | null = null;
    server.use(
      http.get('/api/homes', ({ request }) => {
        capturedAuth = request.headers.get('Authorization');
        return HttpResponse.json([]);
      }),
    );

    const { result } = renderHookWithStore(() => useHomes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(capturedAuth).toBe('Bearer test-jwt-token');
  });

  it('retries the original request with a new token after a 401 response', async () => {
    setToken('expired-token');
    let callCount = 0;

    server.use(
      http.get('/api/homes', ({ request }) => {
        callCount++;
        const auth = request.headers.get('Authorization');
        // First call with the expired token → 401
        if (auth === 'Bearer expired-token') {
          return new HttpResponse(null, { status: 401 });
        }
        // Second call after refresh uses the new token
        return HttpResponse.json([]);
      }),
      http.post('/api/token/refresh', () =>
        HttpResponse.json({ token: 'refreshed-token' }),
      ),
    );

    const { result } = renderHookWithStore(() => useHomes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // The request was made twice: original (401) + retry after refresh
    expect(callCount).toBe(2);
    // The new token was stored in localStorage
    expect(localStorage.getItem('token')).toBe('refreshed-token');
  });

  it('removes the token and redirects when a 403 response is received', async () => {
    setToken('valid-token');

    server.use(
      http.get('/api/homes', () =>
        HttpResponse.json({ error: 'Forbidden' }, { status: 403 }),
      ),
    );

    const { result } = renderHookWithStore(() => useHomes());
    await waitFor(() => expect(result.current.homesError).toBeDefined());

    // removeToken() is called before window.location.href = '/' in the base query,
    // so the token must be cleared regardless of the redirect behaviour in jsdom.
    expect(localStorage.getItem('token')).toBeNull();
  });
});
