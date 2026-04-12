import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils';
import { Navbar } from './navbar';
import { useProfile } from '../../hooks/useProfile';
import { mockProfile } from '../../test-fixtures';

vi.mock('../../hooks/useProfile');
vi.mock('../../assets/logo.svg', () => ({ default: 'mocked-logo.svg' }));

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

vi.mock('@mantine/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/hooks')>();
  return {
    ...actual,
    useMediaQuery: vi.fn().mockReturnValue(false), // desktop by default
  };
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

  it('renders the brand name', () => {
    render(<Navbar />);
    expect(screen.getAllByText(/home anthill/i)[0]).toBeInTheDocument();
  });

  it('renders desktop navigation links', () => {
    render(<Navbar />);
    // Use exact names to avoid matching the brand link's aria-label
    expect(screen.getByRole('link', { name: 'Devices' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Homes' })).toBeInTheDocument();
  });

  it('renders the profile avatar with accessible label', () => {
    render(<Navbar />);
    expect(
      screen.getByRole('img', { name: /profile/i }),
    ).toBeInTheDocument();
  });

  it('navigates to /homes when the Homes link is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    render(<Navbar />);
    await userEvent.setup().click(screen.getByRole('link', { name: 'Homes' }));
    expect(mockNavigate).toHaveBeenCalledWith('/homes');
  });

  it('navigates to /profile when the avatar is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    render(<Navbar />);
    await userEvent.setup().click(screen.getByRole('img', { name: /profile/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});
