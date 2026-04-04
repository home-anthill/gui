import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './login';
import * as authUtils from '../../auth/auth-utils';

vi.mock('../../auth/auth-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof authUtils>();
  return {
    ...actual,
    isLoggedIn: vi.fn(),
  };
});

// Mock the image import to avoid asset-pipeline issues in jsdom
vi.mock('../../assets/home-anthill.png', () => ({
  default: 'mocked-logo.png',
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
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /welcome to home-anthill/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByAltText('Home Anthill')).toBeInTheDocument();
  });

  it('navigates to /main when the user is already logged in', async () => {
    vi.mocked(authUtils.isLoggedIn).mockReturnValue(true);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/main');
    });
  });

  it('does not navigate when the user is not logged in', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
