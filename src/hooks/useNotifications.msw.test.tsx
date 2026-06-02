import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderHookWithStore } from '../test-store';
import { mockNotificationsResponse } from '../test-fixtures';
import { useNotifications } from './useNotifications';

describe('useNotifications (MSW)', () => {
  it('fetches notifications from GET /api/notifications ordered by newest first', async () => {
    const { result } = renderHookWithStore(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[0]?.id).toBe(
      mockNotificationsResponse.notifications[0]?.id,
    );
    expect(result.current.notifications[1]?.id).toBe(
      mockNotificationsResponse.notifications[1]?.id,
    );
  });
});
