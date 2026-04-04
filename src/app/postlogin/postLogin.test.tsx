import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PostLogin from './postLogin';
import useAuth from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth');

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('PostLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls login with the token and navigates to /main', async () => {
    const mockLogin = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      isLogged: () => false,
      tokenState: null,
    });

    render(
      <MemoryRouter initialEntries={['/postlogin#token=my-jwt-token']}>
        <Routes>
          <Route path="/postlogin" element={<PostLogin />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /postlogin/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('my-jwt-token');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/main');
  });

  it('navigates to / and logs an error when no token is in the URL hash', async () => {
    const mockLogin = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      isLogged: () => false,
      tokenState: null,
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      /* empty */
    });

    render(
      <MemoryRouter initialEntries={['/postlogin']}>
        <Routes>
          <Route path="/postlogin" element={<PostLogin />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    expect(mockLogin).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
