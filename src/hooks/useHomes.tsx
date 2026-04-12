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

  const deleteHome = (id: string) => deleteHomeMutation(id);

  // pass a fixed rooms: [], because you cannot add rooms with this api
  const addHome = (name: string, location: string) =>
    addHomeMutation({ name, location, rooms: [] });

  const updateHome = (id: string, name: string, location: string) =>
    updateHomeMutation({ id, name, location });

  return {
    // homes query
    homes,
    loading,
    homesLoading,
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
