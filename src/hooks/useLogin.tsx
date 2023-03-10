import { useGetLoginUrlQuery } from '../services/login';
import { LoginResponse } from '../models/auth';

export function useLogin() {
  const {
    data: login = { loginURL: '' } as LoginResponse,
    isLoading: loginLoading,
    error: loginError
  } = useGetLoginUrlQuery();

  const loading = loginLoading;

  return {
    login,
    loading,
    loginError
  }
}
