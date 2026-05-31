import { ComponentType } from 'react';
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

interface SensorProps {
  features: FeatureValue[];
}

const sensorIcons: Record<
  string,
  ComponentType<{ size?: number; stroke?: number }>
> = {
  temperature: IconThermometer,
  humidity: IconDroplet,
  airpressure: IconGauge,
  motion: IconEye,
  light: IconSun,
  airquality: IconLeaf,
};

export const airQualityLabels = ['Poor', 'Low', 'Good', 'Excellent'] as const;
export const airQualityColors = [
  '#fa5252',
  '#fab005',
  '#94d82d',
  '#40c057',
] as const;

/**
 * Format a float value into a string rounding with s specific precision defined by step.
 * formatByStep(12.3456, 5);      => "12"
 * formatByStep(12.3456, 1);      => "12"
 * formatByStep(12.3456, 0.5);    => "12.3"
 * formatByStep(12.3456, 0.1);    => "12.3"
 * formatByStep(12.3456, 0.01);   => "12.35"
 * formatByStep(12.3456, 0.001);  => "12.35"
 * formatByStep(12.3456, 0.005);  => "12.35"
 *
 * How it works:
 * Math.ceil(-Math.log10(step))
 * converts the step size into the number of decimal digits needed.
 * Smaller steps are capped at 2 decimals:
 *   5      -> 0 decimals
 *   1      -> 0 decimals
 *   0.5    -> 1 decimal
 *   0.1    -> 1 decimal
 *   0.01   -> 2 decimals
 *   0.005  -> 2 decimals
 *   0.001  -> 2 decimals
 * @param value
 * @param step
 */
function formatByStep(value: number, step?: number): string {
  if (!Number.isFinite(value)) {
    throw new Error('value must be a finite number');
  }
  const decimals = step === undefined ? 2 : Math.max(0, Math.ceil(-Math.log10(step)));
  return value.toFixed(Math.min(decimals, 2));
}

function formatSensorValue(feature: FeatureValue): {
  text: string;
  color?: string;
} {
  if (feature.name === 'airquality') {
    if (feature.value < 0 || feature.value > airQualityLabels.length - 1) {
      console.error(`Air quality value out of range: ${feature.value}`);
      return { text: 'Unknown', color: airQualityColors[0] };
    }
    return {
      text: `${airQualityLabels[feature.value]} (${feature.value})`,
      color: airQualityColors[feature.value] ?? airQualityColors[0],
    };
  }
  if (feature.name === 'motion') {
    return {
      text: feature.value ? 'Detected' : 'None',
      color: feature.value ? '#fa5252' : '#40c057',
    };
  }
  return { text: formatByStep(feature.value, feature.spec.step) };
}

export function Sensor({ features }: SensorProps) {
  if (features.length === 0) return null;
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
