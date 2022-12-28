import { useContext } from 'react';

import { AuthContext } from '../auth/AuthContext';
import { Auth } from '../models/auth';

export function useAuth(): Auth {
  return useContext(AuthContext);
}

export default useAuth
