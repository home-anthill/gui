import { useGetProfileQuery, useNewProfileTokenMutation } from '../services/profile';

export function useProfile() {
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError
  } = useGetProfileQuery();
  const [newProfileTokenMutation, { isLoading: newProfileTokenLoading }] = useNewProfileTokenMutation();

  const loading = profileLoading || newProfileTokenLoading;

  const newProfileToken = (id: string) => newProfileTokenMutation(id);

  return {
    profile,
    loading,
    profileError,
    newProfileToken
  }
}
