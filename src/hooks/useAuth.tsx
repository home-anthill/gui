import { useState, useContext, ReactNode } from 'react';

import { AuthContext } from '../auth/AuthContext';
import { Auth } from '../models/auth';
import { setToken, removeToken, isLoggedIn } from '../auth/auth-utils';

export const AuthProvider = (props: {children?: ReactNode}) => {
  const [tokenState, setTokenState] = useState<string | null>(null)

  const login = (token: string) => {
    setToken(token);
    setTokenState(token as string);
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
  };

  const isLogged = () => {
    return isLoggedIn();
  };

  return (
    <AuthContext.Provider value={{tokenState, isLogged, login, logout}}>
      {props.children}
    </AuthContext.Provider>
  );
};

export function useAuth(): Auth {
  return useContext(AuthContext);
}

export default useAuth
