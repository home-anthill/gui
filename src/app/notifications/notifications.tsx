import { Alert, Loader, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconBell } from '@tabler/icons-react';

import { useNotifications } from '../../hooks/useNotifications';
import { Device } from '../../models/device';
import { getPrettyDateFromUnixEpoch } from '../../utils/dateUtils';

import styles from './notifications.module.scss';

function getDeviceName(device: Device): string {
  const name = device.name.trim();
  return name || device.model || device.uuid;
}

export function Notifications() {
  const { notifications, loading, notificationsError } = useNotifications();

  if (loading) {
    return (
      <div className={styles['page-loading']}>
        <Loader color="orange" size="lg" />
      </div>
    );
  }

  if (notificationsError) {
    return (
      <div className={styles['notifications-page']}>
        <Alert icon={<IconAlertCircle size={18} />} color="red" title="Error">
          Unable to load notifications.
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles['notifications-page']}>
      <div className={styles['notifications-header']}>
        <Title
          order={1}
          className={styles['notifications-header-title'] as string}
        >
          Notifications
        </Title>
        <Text
          size="sm"
          mt="xs"
          className={styles['notifications-header-subtitle'] as string}
        >
          Profile notification history
        </Text>
      </div>

      {notifications.length === 0 ? (
        <p className={styles['empty-message']}>No notifications found</p>
      ) : (
        <div className={styles['notifications-list']}>
          {notifications.map((notification, index) => (
            <article
              key={notification.id}
              className={styles['notification-row']}
            >
              <div className={styles['notification-number']}>{index + 1}</div>
              <div className={styles['notification-icon']}>
                <IconBell size={18} stroke={1.5} />
              </div>
              <div className={styles['notification-content']}>
                <div className={styles['notification-main']}>
                  <Text
                    className={styles['notification-description'] as string}
                    fw={600}
                  >
                    {notification.body}
                  </Text>
                  <Text
                    size="xs"
                    className={styles['notification-date'] as string}
                  >
                    {getPrettyDateFromUnixEpoch(notification.sentAt)}
                  </Text>
                </div>
                <Text
                  size="sm"
                  className={styles['notification-devices'] as string}
                >
                  {notification.devices.length > 0
                    ? notification.devices.map(getDeviceName).join(', ')
                    : 'No matching devices'}
                </Text>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
