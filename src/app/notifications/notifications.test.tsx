import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../test-utils';

import { useNotifications } from '../../hooks/useNotifications';
import { mockNotificationsResponse } from '../../test-fixtures';
import { getPrettyDateFromUnixEpoch } from '../../utils/dateUtils';
import Notifications from './notifications';

vi.mock('../../hooks/useNotifications');

describe('Notifications', () => {
  it('renders a compact notification list with number, description, devices, and date', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotificationsResponse.notifications,
      loading: false,
      notificationsError: undefined,
    });

    render(<Notifications />);

    expect(screen.getByRole('heading', { name: /^notifications$/i })).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Device is offline')).toBeInTheDocument();
    expect(screen.getByText('Kitchen sensor')).toBeInTheDocument();
    expect(
      screen.getByText(
        getPrettyDateFromUnixEpoch(
          mockNotificationsResponse.notifications[0]?.sentAt ?? 0,
        ),
      ),
    ).toBeInTheDocument();
  });

  it('renders an empty state', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      loading: false,
      notificationsError: undefined,
    });

    render(<Notifications />);

    expect(screen.getByText(/no notifications found/i)).toBeInTheDocument();
  });
});
