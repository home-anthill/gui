import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedLayout from './ProtectedLayout';
import useAuth from '../hooks/useAuth';
import { Auth } from '../models/auth';

vi.mock('../hooks/useAuth');

const makeAuth = (overrides: Partial<Auth> = {}): Auth => ({
  tokenState: null,
  isLogged: () => false,
  login: vi.fn(),
  logout: vi.fn(),
  ...overrides,
});

describe('ProtectedLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when the user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue(makeAuth({ isLogged: () => false }));

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedLayout>
                <div>Protected Content</div>
              </ProtectedLayout>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when the user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue(
      makeAuth({ isLogged: () => true, tokenState: 'fake-token' }),
    );

    render(
      <MemoryRouter>
        <ProtectedLayout>
          <div>Protected Content</div>
        </ProtectedLayout>
      </MemoryRouter>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
