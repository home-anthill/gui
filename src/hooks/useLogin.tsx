import { LoginResponse, useGetLoginUrlQuery } from '../services/login';

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
