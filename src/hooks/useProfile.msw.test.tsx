import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderHookWithStore } from '../test-store';
import { useProfile } from './useProfile';
import { mockProfile } from '../test-fixtures';

describe('useProfile (MSW)', () => {
  it('fetches the profile from GET /api/profile', async () => {
    const { result } = renderHookWithStore(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile?.id).toBe(mockProfile.id);
    expect(result.current.profile?.github.login).toBe(mockProfile.github.login);
    expect(result.current.profile?.github.name).toBe(mockProfile.github.name);
  });

  it('generates a new API token via POST /api/profiles/:id/tokens', async () => {
    const { result } = renderHookWithStore(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const response = await result.current.newProfileToken('p1');
    expect((response as { data?: { apiToken: string } }).data?.apiToken).toBe(
      'new-api-token',
    );
  });

  it('returns profileError when GET /api/profile fails', async () => {
    const { server } = await import('../mocks/server');
    const { http, HttpResponse } = await import('msw');
    server.use(
      http.get('/api/profile', () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    );

    const { result } = renderHookWithStore(() => useProfile());
    await waitFor(() => expect(result.current.profileError).toBeDefined());
  });
});
