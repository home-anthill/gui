import { useGetOnlineStatusesQuery } from '../services/online';

interface UseOnlineOptions {
  skip?: boolean;
}

export function useOnline(id: string, options: UseOnlineOptions = {}) {
  const { data, isLoading: onlineLoading, error: onlineError } =
    useGetOnlineStatusesQuery(undefined, { skip: options.skip ?? false });
  const online = data?.find(status => status.deviceId === id);

  const loading = onlineLoading;

  return {
    online,
    loading,
    onlineError,
  };
}
