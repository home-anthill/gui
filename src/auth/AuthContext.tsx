import { createContext } from 'react';
import { Auth } from '../models/auth';

export const AuthContext = createContext<Auth>({
  tokenState: null,
  isLogged: () => false,
  login: (_token: string) => undefined,
  logout: () => undefined,
});
