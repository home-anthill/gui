import { Title, Paper, Text } from '@mantine/core';
import {
  IconActivityHeartbeat,
  IconDroplet,
  IconGauge,
  IconThermometer,
  IconSun,
  IconEye,
  IconLeaf,
} from '@tabler/icons-react';

import { FeatureValue } from '../../../models/value';
import { getPrettyDateFromUnixEpoch } from '../../../utils/dateUtils';

import styles from './sensor.module.scss';

export const airQualityLabels = ['Poor', 'Low', 'Good', 'Excellent'] as const;
export const airQualityColors = [
  '#fa5252',
  '#fab005',
  '#94d82d',
  '#40c057',
] as const;

const sensorIcons: Record<
  string,
  React.ComponentType<{ size?: number; stroke?: number }>
> = {
  temperature: IconThermometer,
  humidity: IconDroplet,
  airpressure: IconGauge,
  motion: IconEye,
  light: IconSun,
  airquality: IconLeaf,
};

function formatSensorValue(feature: FeatureValue): {
  text: string;
  color?: string;
} {
  if (feature.name === 'airquality') {
    const val = feature.value as number;
    if (val < 0 || val > airQualityLabels.length - 1) {
      console.warn(`Air quality value out of range: ${val}`);
      return { text: 'Unknown', color: airQualityColors[0] };
    }
    return {
      text: `${airQualityLabels[val]} (${val})`,
      color: airQualityColors[val] ?? airQualityColors[0],
    };
  }
  if (feature.name === 'motion') {
    return {
      text: feature.value ? 'Detected' : 'None',
      color: feature.value ? '#fa5252' : '#40c057',
    };
  }
  const num = (feature.value as number).toFixed(
    feature.name === 'temperature' ? 1 : 0,
  );
  return { text: num };
}

interface SensorProps {
  features: FeatureValue[];
}

export function Sensor({ features }: SensorProps) {
  if (features.length === 0) return null;

  return (
    <section className={styles['detail-section']}>
      <div className={styles['section-header']}>
        <div className={styles['section-icon']}>
          <IconActivityHeartbeat size={16} stroke={1.5} />
        </div>
        <Title order={2} size="h3" c="orange">
          Sensors
        </Title>
      </div>

      <div className={styles['features-grid']}>
        {features.map((feature) => {
          const { text, color } = formatSensorValue(feature);
          const IconComp = sensorIcons[feature.name];
          return (
            <Paper
              key={feature.featureUuid}
              className={styles['sensor-card'] ?? ''}
              radius="md"
              withBorder
            >
              <div className={styles['sensor-card-header']}>
                <div className={styles['sensor-card-icon']}>
                  {IconComp && <IconComp size={28} stroke={1.8} />}
                </div>
                <div className={styles['sensor-card-label']}>
                  <h4>{feature.name}</h4>
                </div>
              </div>
              <div
                className={styles['sensor-card-value']}
                style={color ? { color } : undefined}
              >
                <span className={styles['value-text']}>{text}</span>
                {feature.unit && feature.unit !== '-' && (
                  <span className={styles['value-unit']}>{feature.unit}</span>
                )}
              </div>
              <div className={styles['sensor-card-footer']}>
                <Text size="xs" c="dimmed">
                  Updated {getPrettyDateFromUnixEpoch(feature.modifiedAt)}
                </Text>
              </div>
            </Paper>
          );
        })}
      </div>
    </section>
  );
}
