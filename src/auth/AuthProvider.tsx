import React, { useState } from 'react';

import { AuthContext } from './AuthContext';
import { setToken, removeToken, isLoggedIn } from './auth-utils';

export default function AuthProvider(props: any) {
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
}
