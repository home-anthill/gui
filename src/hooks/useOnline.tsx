import { skipToken } from '@reduxjs/toolkit/query/react';

import { useGetOnlineQuery } from '../services/online';

interface UseOnlineOptions {
  skip?: boolean;
}

export function useOnline(id: string, options: UseOnlineOptions = {}) {
  const {
    data: online,
    isLoading: onlineLoading,
    error: onlineError
  } = useGetOnlineQuery(options.skip ? skipToken : id);

  const loading = onlineLoading;

  return {
    online,
    loading,
    onlineError,
  }
}
