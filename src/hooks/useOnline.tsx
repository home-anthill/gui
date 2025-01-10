import { useGetOnlineQuery } from '../services/online';
import { Online } from '../models/online';

export function useOnline(id: string) {
  const {
    data: online = {} as Online,
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
