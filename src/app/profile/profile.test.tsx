import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils';
import Profile from './profile';
import { useProfile } from '../../hooks/useProfile';
import { mockProfile } from '../../test-fixtures';

vi.mock('../../hooks/useProfile');
// Navbar uses useProfile too — already mocked above via the same module
vi.mock('../../assets/home-anthill.png', () => ({
  default: 'mocked-logo.png',
}));

const baseProfile = {
  profile: mockProfile,
  loading: false,
  profileError: undefined,
  newProfileToken: vi.fn(),
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
    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /regenerate apitoken/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/\*{8}/)).toBeInTheDocument();
  });

  it('calls newProfileToken when Regenerate button is clicked', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const mockToken = vi
      .fn()
      .mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ apiToken: 'new-token' }),
      });
    vi.mocked(useProfile).mockReturnValue({
      ...baseProfile,
      newProfileToken: mockToken,
    });
    render(<Profile />);
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /regenerate apitoken/i }));
    expect(mockToken).toHaveBeenCalledWith('p1');
  });
});
