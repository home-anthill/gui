import { useGetNotificationsQuery } from '../services/notifications';

export function useNotifications() {
  const {
    data,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useGetNotificationsQuery();

  return {
    notifications: data?.notifications ?? [],
    loading: notificationsLoading,
    notificationsError,
  };
}
