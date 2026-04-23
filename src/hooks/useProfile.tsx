import {
  useGetProfileQuery,
  useLogoutMutation,
  useNewProfileTokenMutation,
} from '../services/profile';

export function useProfile() {
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError
  } = useGetProfileQuery();
  const [newProfileTokenMutation, { isLoading: newProfileTokenLoading }] = useNewProfileTokenMutation();
  const [logoutMutation, { isLoading: logoutLoading }] = useLogoutMutation();

  const loading = profileLoading || newProfileTokenLoading || logoutLoading;

  const newProfileToken = (id: string) => newProfileTokenMutation(id);
  const logout = () => logoutMutation();

  return {
    profile,
    loading,
    profileError,
    newProfileToken,
    logout,
  }
}
