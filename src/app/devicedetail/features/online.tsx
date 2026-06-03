import { useEffect, useState } from 'react';
import {
  Title,
  Paper,
  Text,
  Loader,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconActivityHeartbeat,
  IconBell,
  IconBellOff,
  IconBolt,
} from '@tabler/icons-react';
import { toast } from 'sonner';

import { FeatureValue } from '../../../models/value';
import { getPrettyDateFromDateString } from '../../../utils/dateUtils';
import { useOnline } from '../../../hooks/useOnline';
import { useFeatureNotification } from '../../../hooks/useFeatureNotification';
import { logError } from '../../../utils/logger';

import styles from './online.module.scss';

interface OnlineProps {
  deviceId: string;
  features: FeatureValue[];
}

function cssClass(name: string): string {
  return styles[name] as string;
}

const OFFLINE_THRESHOLD_MS = 60 * 1000;
const ONLINE_COLOR = '#40c057';
const OFFLINE_COLOR = '#fd2121';
const UNKNOWN_COLOR = '#868e96';

function isOffline(modifiedAtISO: string, currentTimeISO: string): boolean {
  const modDate = new Date(modifiedAtISO);
  const currentDate = new Date(currentTimeISO);
  return modDate.getTime() < currentDate.getTime() - OFFLINE_THRESHOLD_MS;
}

function getOnlineStatus(online: ReturnType<typeof useOnline>['online']): {
  text: 'Online' | 'Offline' | 'Unknown';
  color: string;
} {
  if (!online) {
    return { text: 'Unknown', color: UNKNOWN_COLOR };
  }

  if (isOffline(online.modifiedAt, online.currentTime)) {
    return { text: 'Offline', color: OFFLINE_COLOR };
  }

  return { text: 'Online', color: ONLINE_COLOR };
}

export function Online({ deviceId, features }: OnlineProps) {
  const { online, loading } = useOnline(deviceId, {
    skip: features.length === 0,
  });
  const { updateFeatureNotification, updating } = useFeatureNotification();
  const [silencedByFeature, setSilencedByFeature] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setSilencedByFeature(
      Object.fromEntries(
        features.map((feature) => [
          feature.featureUuid,
          feature.notificationSilenced ?? false,
        ]),
      ),
    );
  }, [features]);

  const { text: statusText, color: statusColor } = getOnlineStatus(online);

  if (features.length === 0) return null;

  if (loading) {
    return (
      <div className="page-loading">
        <Loader color="orange" size="lg" />
      </div>
    );
  }

  const handleNotificationChange = async (
    featureUuid: string,
    notificationSilenced: boolean,
  ) => {
    const previous = silencedByFeature[featureUuid] ?? false;
    setSilencedByFeature((current) => ({
      ...current,
      [featureUuid]: notificationSilenced,
    }));

    try {
      await updateFeatureNotification(
        deviceId,
        featureUuid,
        notificationSilenced,
      ).unwrap();
      toast.success(
        notificationSilenced
          ? 'Notifications silenced'
          : 'Notifications enabled',
      );
    } catch (err) {
      setSilencedByFeature((current) => ({
        ...current,
        [featureUuid]: previous,
      }));
      logError('Cannot update feature notification', err);
    }
  };

  return (
    <section className={cssClass('sensor-section')}>
      <div className={cssClass('sensor-section-header')}>
        <div className={cssClass('sensor-section-icon')}>
          <IconActivityHeartbeat size={22} stroke={1.5} />
        </div>
        <Title
          order={2}
          size="h3"
          className={cssClass('sensor-section-text')}
        >
          Online
        </Title>
      </div>

      <div className={cssClass('features-grid')}>
        {features.map((feature) => {
          const notificationSilenced =
            silencedByFeature[feature.featureUuid] ?? false;
          const notificationLabel = notificationSilenced
            ? 'Enable notifications'
            : 'Silence notifications';

          return (
            <Paper
              key={feature.featureUuid}
              className={cssClass('sensor-card')}
              radius="md"
              withBorder
            >
              <div className={cssClass('sensor-card-header')}>
                <div className={cssClass('sensor-card-icon')}>
                  <IconBolt size={28} stroke={1.8} />
                </div>
                <div className={cssClass('sensor-card-label')}>
                  <h4>{feature.name}</h4>
                </div>
                <Tooltip label={notificationLabel} withArrow>
                  <ActionIcon
                    className={cssClass('notification-toggle')}
                    variant="light"
                    color={notificationSilenced ? 'gray' : 'orange'}
                    size="lg"
                    disabled={updating}
                    aria-label={notificationLabel}
                    onClick={() =>
                      handleNotificationChange(
                        feature.featureUuid,
                        !notificationSilenced,
                      )
                    }
                  >
                    {notificationSilenced ? (
                      <IconBellOff size={20} stroke={1.5} />
                    ) : (
                      <IconBell size={20} stroke={1.5} />
                    )}
                  </ActionIcon>
                </Tooltip>
              </div>
              <div className={cssClass('sensor-card-value')}>
                <span
                  className={cssClass('value-text')}
                  style={{ color: statusColor }}
                >
                  {statusText}
                </span>
              </div>
              <div className={cssClass('sensor-card-footer')}>
                {online && online.modifiedAt ? (
                  <Text size="xs" c="dimmed">
                    Updated {getPrettyDateFromDateString(online.modifiedAt)}
                  </Text>
                ) : (
                  <Text size="xs" c="dimmed">
                    Status not available
                  </Text>
                )}
              </div>
            </Paper>
          );
        })}
      </div>
    </section>
  );
}
