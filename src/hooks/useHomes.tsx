import { useCallback } from 'react';

import {
  useGetHomesQuery,
  useLazyGetHomesQuery,
  useDeleteHomeByIdMutation,
  useAddHomeMutation,
  useUpdateHomeMutation,
} from '../services/homes';
import { Home } from '../models/home';

export function useHomes() {
  const {
    data: homes = [] as Home[],
    isLoading: homesLoading,
    error: homesError,
  } = useGetHomesQuery();
  const [
    trigger,
    {
      data: lazyHomes = [] as Home[],
      isLoading: lazyHomesLoading,
      error: lazyHomesError,
    },
  ] = useLazyGetHomesQuery();
  const [deleteHomeMutation, { isLoading: deleteHomeLoading }] =
    useDeleteHomeByIdMutation();
  const [addHomeMutation, { isLoading: addHomeLoading }] = useAddHomeMutation();
  const [updateHomeMutation, { isLoading: updateHomeLoading }] =
    useUpdateHomeMutation();

  const loading =
    homesLoading || deleteHomeLoading || addHomeLoading || updateHomeLoading;

  const deleteHome = useCallback(
    (id: string) => deleteHomeMutation(id),
    [deleteHomeMutation]
  );

  const addHome = useCallback(
    // pass a fixed rooms: [], because you cannot add rooms with this api
    (name: string, location: string) =>
      addHomeMutation({ name, location, rooms: [] }),
    [addHomeMutation]
  );

  const updateHome = useCallback(
    (id: string, name: string, location: string) =>
      updateHomeMutation({ id, name, location }),
    [updateHomeMutation]
  );

  return {
    // homes query
    homes,
    loading,
    homesError,
    // homes lazy query
    trigger,
    lazyHomes,
    lazyHomesLoading,
    lazyHomesError,
    // mutations
    deleteHome,
    addHome,
    updateHome,
  };
}
