import { ComponentType, useEffect, useState } from 'react';
import { ActionIcon, Paper, Text, Title, Tooltip } from '@mantine/core';
import {
  IconActivityHeartbeat,
  IconBell,
  IconBellOff,
  IconDroplet,
  IconGauge,
  IconThermometer,
  IconSun,
  IconEye,
  IconLeaf,
  IconAlertTriangle,
  IconFlame,
  IconSnowflake,
  IconTemperature,
  IconZzz,
} from '@tabler/icons-react';
import { toast } from 'sonner';

import { FeatureValue } from '../../../models/value';
import { useFeatureNotification } from '../../../hooks/useFeatureNotification';
import { getPrettyDateFromUnixEpoch } from '../../../utils/dateUtils';
import { logError } from '../../../utils/logger';

import styles from './sensor.module.scss';

interface SensorProps {
  deviceId: string;
  features: FeatureValue[];
}

const notificationFeatureNames = new Set(['motion', 'mode']);

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
  mode: IconTemperature,
};

const admittedModeValues = [-1, 0, 1, 2] as const;
type ModeValue = (typeof admittedModeValues)[number];

const modeIcons: Record<
  ModeValue,
  {
    label: string;
    icon: ComponentType<{ size?: number; stroke?: number }>;
  }
> = {
  [-1]: { label: 'Error', icon: IconAlertTriangle },
  0: { label: 'Sleep', icon: IconZzz },
  1: { label: 'Cold', icon: IconSnowflake },
  2: { label: 'Heat', icon: IconFlame },
};

function isModeValue(value: number): value is ModeValue {
  return admittedModeValues.some((modeValue) => modeValue === value);
}

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

export function Sensor({ deviceId, features }: SensorProps) {
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

  if (features.length === 0) return null;

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
          const mode =
            feature.name === 'mode' && isModeValue(feature.value)
              ? modeIcons[feature.value]
              : undefined;
          const ModeIcon = mode?.icon;
          const supportsNotifications = notificationFeatureNames.has(
            feature.name,
          );
          const notificationSilenced =
            silencedByFeature[feature.featureUuid] ?? false;
          const notificationLabel = notificationSilenced
            ? 'Enable notifications'
            : 'Silence notifications';
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
                {supportsNotifications && (
                  <Tooltip label={notificationLabel} withArrow>
                    <ActionIcon
                      className={styles['notification-toggle']}
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
                )}
              </div>
              <div
                className={styles['sensor-card-value']}
                style={color ? { color } : undefined}
              >
                {mode && ModeIcon ? (
                  <span
                    className={styles['mode-icon']}
                    role="img"
                    aria-label={mode.label}
                  >
                    <ModeIcon size={42} stroke={1.8} />
                  </span>
                ) : (
                  <span className={styles['value-text']}>{text}</span>
                )}
                {!mode && feature.unit && feature.unit !== '-' && (
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
