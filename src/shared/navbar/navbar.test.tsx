import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../test-utils';
import Navbar from './navbar';
import { useProfile } from '../../hooks/useProfile';
import { mockProfile } from '../../test-fixtures';

vi.mock('../../hooks/useProfile');
vi.mock('../../assets/home-anthill.png', () => ({
  default: 'mocked-logo.png',
}));

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const baseProfile = {
  profile: mockProfile,
  loading: false,
  profileError: undefined,
  newProfileToken: vi.fn(),
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProfile).mockReturnValue(baseProfile);
  });

  it('renders the page', () => {
    render(<Navbar />);
    const devicesButtons = screen.getAllByRole('button', { name: /devices/i });
    expect(devicesButtons.length).toBeGreaterThan(0);
    const homesButtons = screen.getAllByRole('button', { name: /homes/i });
    expect(homesButtons.length).toBeGreaterThan(0);
    // image
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
    // profile avatar button
    expect(
      screen.getByRole('button', { name: /profile icon/i }),
    ).toBeInTheDocument();
  });

  it('navigates to /profile when the avatar button is clicked', async () => {
    render(<Navbar />);
    await userEvent.click(
      screen.getByRole('button', { name: /profile icon/i }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('navigates to /main/devices when DEVICES is clicked', async () => {
    render(<Navbar />);
    const devicesButtons = screen.getAllByRole('button', {
      name: /^devices$/i,
    });
    await userEvent.click(devicesButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/main/devices');
  });

  it('navigates to /main/homes when HOMES is clicked', async () => {
    render(<Navbar />);
    const homesButtons = screen.getAllByRole('button', { name: /^homes$/i });
    await userEvent.click(homesButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/main/homes');
  });
});
