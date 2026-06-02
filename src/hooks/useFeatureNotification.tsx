import { useCallback } from 'react';

import { useUpdateFeatureNotificationMutation } from '../services/devices';

export function useFeatureNotification() {
  const [updateFeatureNotificationMutation, { isLoading }] =
    useUpdateFeatureNotificationMutation();

  const updateFeatureNotification = useCallback(
    (deviceId: string, featureUuid: string, notificationSilenced: boolean) =>
      updateFeatureNotificationMutation({
        deviceId,
        featureUuid,
        notificationSilenced,
      }),
    [updateFeatureNotificationMutation],
  );

  return {
    updateFeatureNotification,
    updating: isLoading,
  };
}
