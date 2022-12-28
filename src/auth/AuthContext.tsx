import { createContext } from 'react';
import { Auth } from '../models/auth';

export const AuthContext = createContext<Auth>({
  tokenState: null,
  isLogged: () => false,
  login: () => ({}),
  logout: () => ({})
} as Auth);
