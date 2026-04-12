import { useGetOnlineQuery } from '../services/online';

export function useOnline(id: string) {
  const {
    data: online,
    isLoading: onlineLoading,
    error: onlineError
  } = useGetOnlineQuery(id);

  const loading = onlineLoading;

  return {
    online,
    loading,
    onlineError,
  }
}
