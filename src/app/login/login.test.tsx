import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test-utils';
import Login from './login';
import * as authUtils from '../../auth/auth-utils';

vi.mock('../../auth/auth-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof authUtils>();
  return {
    ...actual,
    isLoggedIn: vi.fn(),
  };
});

// Mock the SVG logo import to avoid asset-pipeline issues in jsdom
vi.mock('../../assets/login-brand-logo.svg', () => ({
  default: 'mocked-logo.svg',
}));

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authUtils.isLoggedIn).mockReturnValue(false);
  });

  it('renders the login page', () => {
    render(<Login />);
    expect(
      screen.getByRole('button', { name: /sign in with github/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByAltText('Home Anthill').length).toBeGreaterThan(0);
    expect(screen.getByText(/real-time sensors/i)).toBeInTheDocument();
  });

  it('navigates to / when the user is already logged in', async () => {
    vi.mocked(authUtils.isLoggedIn).mockReturnValue(true);

    render(<Login />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('does not navigate when the user is not logged in', async () => {
    render(<Login />);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
