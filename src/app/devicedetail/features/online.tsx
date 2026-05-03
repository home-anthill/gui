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

function isOffline(modifiedAtISO: string, currentTimeISO: string): boolean {
  const modDate = new Date(modifiedAtISO);
  const currentDate = new Date(currentTimeISO);
  return modDate.getTime() < currentDate.getTime() - OFFLINE_THRESHOLD_MS;
}

export function Online({ deviceId, features }: OnlineProps) {
  const { online, loading, onlineError } = useOnline(deviceId, {
    skip: features.length === 0,
  });

  const offline = online ? isOffline(online.modifiedAt, online.currentTime) : false;
  const statusText = offline ? 'Offline' : 'Online';
  const statusColor = offline ? '#fd2121' : '#40c057';

  if (onlineError || features.length === 0) return null;

  if (loading) {
    return (
      <div className="page-loading">
        <Loader color="orange" size="lg" />
      </div>
    );
  }

  return (
    <section className={styles['detail-section']}>
      <div className={styles['section-header']}>
        <div className={styles['section-icon']}>
          <IconActivityHeartbeat size={16} stroke={1.5} />
        </div>
        <Title order={2} size="h3" c="orange">
          Power Outage
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
                {online && online.modifiedAt && (
                  <Text size="xs" c="dimmed">
                    Updated{' '}
                    {getPrettyDateFromDateString(online.modifiedAt)}
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
