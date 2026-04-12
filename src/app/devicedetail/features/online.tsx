import { Title, Paper, Text } from '@mantine/core';
import { IconActivityHeartbeat, IconBolt } from '@tabler/icons-react';
import { FeatureValue } from '../../../models/value';
import { getPrettyDateFromUnixEpoch } from '../../../utils/dateUtils';
import styles from './online.module.scss';

interface OnlineProps {
  features: FeatureValue[];
}

export function Online({ features }: OnlineProps) {
  if (features.length === 0) return null;

  return (
    <section className={styles['detail-section']}>
      <div className={styles['section-header']}>
        <div className={styles['section-icon']}>
          <IconActivityHeartbeat size={16} stroke={1.5} />
        </div>
        <Title order={2} size="h3" c="orange">
          Presence
        </Title>
      </div>

      <div className={styles['features-grid']}>
        {features.map((feature) => {
          const statusText = feature.value ? 'Present' : 'Absent';
          const statusColor = feature.value ? '#40c057' : '#fa5252';

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
              <div
                className={styles['sensor-card-value']}
                style={{ color: statusColor }}
              >
                <span className={styles['value-text']}>{statusText}</span>
              </div>
              <div className={styles['sensor-card-footer']}>
                <Text size="xs" c="dimmed">
                  Updated{' '}
                  {getPrettyDateFromUnixEpoch(feature.modifiedAt)}
                </Text>
              </div>
            </Paper>
          );
        })}
      </div>
    </section>
  );
}
