import { useCallback } from 'react'

import { useGetProfileQuery, useNewProfileTokenMutation } from '../services/profile';
import { Profile } from '../models/profile';

export function useProfile() {
  const {
    data: profile = {} as Profile,
    isLoading: profileLoading,
    error: profileError
  } = useGetProfileQuery();
  const [newProfileTokenMutation, { isLoading: newProfileTokenLoading }] = useNewProfileTokenMutation();

  const loading = profileLoading || newProfileTokenLoading;

  const newProfileToken = useCallback(
    (id: string) => newProfileTokenMutation(id),
    [newProfileTokenMutation]
  );

  return {
    profile,
    loading,
    profileError,
    newProfileToken
  }
}
