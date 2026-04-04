import { describe, it, expect, vi, beforeEach } from 'vitest';

import OnlineValue from './onlinevalue';
import { render, screen } from '../../../../test-utils';
import { useOnline } from '../../../../hooks/useOnline';
import { mockOnlineNow, mockOnlineOffline } from '../../../../test-fixtures';
import { Online } from '../../../../models/online';

vi.mock('../../../../hooks/useOnline');

const baseOnline = {
  online: {} as Online,
  loading: false,
  onlineError: undefined,
};

describe('OnlineValue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the loading state', () => {
    vi.mocked(useOnline).mockReturnValue({ ...baseOnline, loading: true });
    render(<OnlineValue id="d1" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows an error message when the request fails', () => {
    vi.mocked(useOnline).mockReturnValue({
      ...baseOnline,
      onlineError: { status: 'FETCH_ERROR' as const, error: 'Error' },
    });
    render(<OnlineValue id="d1" />);
    expect(screen.getByText(/cannot check if online/i)).toBeInTheDocument();
  });

  it('shows Online when the device is recently active', () => {
    vi.mocked(useOnline).mockReturnValue({
      ...baseOnline,
      online: mockOnlineNow,
    });
    render(<OnlineValue id="d1" />);
    expect(screen.getByText(/online/i)).toBeInTheDocument();

    expect(
      screen.getByText(/\d{2}:\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}/),
    ).toBeInTheDocument();
  });

  it('shows Offline when the device has not been seen recently', () => {
    vi.mocked(useOnline).mockReturnValue({
      ...baseOnline,
      online: mockOnlineOffline,
    });
    render(<OnlineValue id="d1" />);
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });
});
