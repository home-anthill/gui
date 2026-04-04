import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import { act, ReactNode } from 'react';

import { AuthProvider, useAuth } from './useAuth';
import { TOKEN_NAME } from '../auth/auth-utils';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthProvider / useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('isLogged returns false when no token is stored', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isLogged()).toBe(false);
  });

  it('tokenState starts as null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.tokenState).toBeNull();
  });

  it('login stores the token in localStorage and updates tokenState', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login('my-jwt');
    });

    expect(localStorage.getItem(TOKEN_NAME)).toBe('my-jwt');
    expect(result.current.tokenState).toBe('my-jwt');
  });

  it('isLogged returns true after login', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login('my-jwt');
    });

    expect(result.current.isLogged()).toBe(true);
  });

  it('logout removes the token from localStorage and resets tokenState', () => {
    localStorage.setItem(TOKEN_NAME, 'existing-token');
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem(TOKEN_NAME)).toBeNull();
    expect(result.current.tokenState).toBeNull();
  });

  it('provides the context to child components', () => {
    render(
      <AuthProvider>
        <div data-testid="child">child</div>
      </AuthProvider>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
