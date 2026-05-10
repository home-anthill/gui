import { Title, Paper, Text, Loader } from '@mantine/core';
import { IconActivityHeartbeat, IconBolt } from '@tabler/icons-react';

import { FeatureValue } from '../../../models/value';
import { getPrettyDateFromDateString } from '../../../utils/dateUtils';
import { useOnline } from '../../../hooks/useOnline';

import styles from './online.module.scss';

interface OnlineProps {
  deviceId: string;
  features: FeatureValue[];
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

  const { text: statusText, color: statusColor } = getOnlineStatus(online);

  if (features.length === 0) return null;

  if (loading) {
    return (
      <div className="page-loading">
        <Loader color="orange" size="lg" />
      </div>
    );
  }

  return (
    <section className={styles['sensor-section']}>
      <div className={styles['sensor-section-header']}>
        <div className={styles['sensor-section-icon']}>
          <IconActivityHeartbeat size={22} stroke={1.5} />
        </div>
        <Title
          order={2}
          size="h3"
          className={styles['sensor-section-text'] ?? ''}
        >
          Sensors
        </Title>
      </div>

      <div className={styles['features-grid']}>
        {features.map((feature) => {
          return (
            <Paper
              key={feature.featureUuid}
              className={styles['sensor-card'] ?? ''}
              radius="md"
              withBorder
            >
              <div className={styles['sensor-card-header']}>
                <div className={styles['sensor-card-icon']}>
                  <IconBolt size={28} stroke={1.8} />
                </div>
                <div className={styles['sensor-card-label']}>
                  <h4>{feature.name}</h4>
                </div>
              </div>
              <div className={styles['sensor-card-value']}>
                <span
                  className={styles['value-text']}
                  style={{ color: statusColor }}
                >
                  {statusText}
                </span>
              </div>
              <div className={styles['sensor-card-footer']}>
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
