import { describe, it, expect, beforeEach } from 'vitest';
import {
  isLoggedIn,
  getToken,
  setToken,
  removeToken,
  TOKEN_NAME,
} from './auth-utils';

describe('auth-utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isLoggedIn', () => {
    it('returns false when no token is stored', () => {
      expect(isLoggedIn()).toBe(false);
    });

    it('returns true when a token is stored', () => {
      localStorage.setItem(TOKEN_NAME, 'test-token');
      expect(isLoggedIn()).toBe(true);
    });

    it('uses the supplied token name', () => {
      localStorage.setItem('custom-key', 'value');
      expect(isLoggedIn('custom-key')).toBe(true);
      expect(isLoggedIn('other-key')).toBe(false);
    });
  });

  describe('getToken', () => {
    it('returns null when no token is stored', () => {
      expect(getToken()).toBeNull();
    });

    it('returns the stored token', () => {
      localStorage.setItem(TOKEN_NAME, 'my-jwt');
      expect(getToken()).toBe('my-jwt');
    });
  });

  describe('setToken', () => {
    it('stores the token in localStorage under TOKEN_NAME', () => {
      setToken('new-token');
      expect(localStorage.getItem(TOKEN_NAME)).toBe('new-token');
    });

    it('stores the token under a custom key', () => {
      setToken('val', 'custom-key');
      expect(localStorage.getItem('custom-key')).toBe('val');
    });
  });

  describe('removeToken', () => {
    it('removes the token from localStorage', () => {
      localStorage.setItem(TOKEN_NAME, 'to-remove');
      removeToken();
      expect(localStorage.getItem(TOKEN_NAME)).toBeNull();
    });

    it('removes the token under a custom key', () => {
      localStorage.setItem('custom-key', 'val');
      removeToken('custom-key');
      expect(localStorage.getItem('custom-key')).toBeNull();
    });
  });
});
