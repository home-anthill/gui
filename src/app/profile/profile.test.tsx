import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../test-utils';
import Profile from './profile';
import { useProfile } from '../../hooks/useProfile';
import { mockProfile } from '../../test-fixtures';
import { setToken } from '../../auth/auth-utils';

vi.mock('../../hooks/useProfile');

const baseProfile = {
  profile: mockProfile,
  loading: false,
  profileError: undefined,
  newProfileToken: vi.fn(),
  logout: vi.fn(),
};

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProfile).mockReturnValue(baseProfile);
  });

  it('renders the Profile page', () => {
    render(<Profile />);
    expect(
      screen.getByRole('heading', { name: /^profile$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /regenerate api token/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/\*{8}/)).toBeInTheDocument();
  });

  it('opens the confirmation modal when Regenerate API Token is clicked', async () => {
    render(<Profile />);
    await userEvent.click(
      screen.getByRole('button', { name: /regenerate api token/i }),
    );
    expect(
      await screen.findByText(/critical operation warning/i),
    ).toBeInTheDocument();
  });

  it('calls newProfileToken after confirming in the modal', async () => {
    const mockToken = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ apiToken: 'new-token' }),
    });
    vi.mocked(useProfile).mockReturnValue({
      ...baseProfile,
      newProfileToken: mockToken,
    });
    render(<Profile />);
    await userEvent.click(
      screen.getByRole('button', { name: /regenerate api token/i }),
    );
    await userEvent.click(
      await screen.findByRole('button', { name: /confirm & regenerate/i }),
    );
    await waitFor(() => {
      expect(mockToken).toHaveBeenCalledWith('p1');
    });
  });

  it('calls the server logout and removes the local token', async () => {
    const mockLogout = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(undefined),
    });
    vi.mocked(useProfile).mockReturnValue({
      ...baseProfile,
      logout: mockLogout,
    });
    setToken('test-jwt-token');

    render(<Profile />);
    await userEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledOnce();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
