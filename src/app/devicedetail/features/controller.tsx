import {
  Title,
  Paper,
  Text,
  Button,
  Switch,
  Select,
  Slider,
} from '@mantine/core';
import { IconToggleLeft, IconSend } from '@tabler/icons-react';

import { FeatureValue } from '../../../models/value';
import { getPrettyDateFromUnixEpoch } from '../../../utils/dateUtils';

import styles from './controller.module.scss';

interface ControlInputProps {
  feature: FeatureValue;
  onChangeValue: (featureId: string, value: number) => void;
}

function ControlInput({ feature, onChangeValue }: ControlInputProps) {
  switch (feature.name) {
    case 'on':
      return (
        <Switch
          checked={feature.value === 1}
          onChange={(e) =>
            onChangeValue(feature.featureUuid, e.currentTarget.checked ? 1 : 0)
          }
          color="orange"
          size="md"
          label={feature.value ? 'On' : 'Off'}
        />
      );

    case 'setpoint':
      return (
        <div className={styles['slider-wrapper']}>
          <div className={styles['slider-labels']}>
            <Text size="sm" c="dimmed">
              {feature.spec.min?.toString() ?? '17'}
            </Text>
            <Text fw={600} c="orange">
              {feature.value}°C
            </Text>
            <Text size="sm" c="dimmed">
              {feature.spec.max?.toString() ?? '30'}
            </Text>
          </div>
          <Slider
            value={feature.value as number}
            onChange={(value) => onChangeValue(feature.featureUuid, value)}
            min={feature.spec.min ?? 17}
            max={feature.spec.max ?? 30}
            step={feature.spec.step ?? 1}
            color="orange"
          />
        </div>
      );

    case 'tolerance':
      return (
        <div className={styles['slider-wrapper']}>
          <div className={styles['slider-labels']}>
            <Text size="sm" c="dimmed">
              {feature.spec.min?.toString() ?? '0'}
            </Text>
            <Text fw={600} c="orange">
              {feature.value}°C
            </Text>
            <Text size="sm" c="dimmed">
              {feature.spec.max?.toString() ?? '10'}
            </Text>
          </div>
          <Slider
            value={feature.value as number}
            onChange={(value) => onChangeValue(feature.featureUuid, value)}
            min={feature.spec.min ?? 0}
            max={feature.spec.max ?? 10}
            step={feature.spec.step ?? 1}
            color="orange"
          />
        </div>
      );

    case 'mode':
      return (
        <Select
          value={String(feature.value)}
          onChange={(value) =>
            value && onChangeValue(feature.featureUuid, Number(value))
          }
          data={
            feature.spec.list?.map((l) => ({
              value: l.value.toString(),
              label: l.text,
            })) ?? []
          }
          placeholder="Select mode"
        />
      );

    case 'fanSpeed':
      return (
        <Select
          value={String(feature.value)}
          onChange={(value) =>
            value && onChangeValue(feature.featureUuid, Number(value))
          }
          data={
            feature.spec.list?.map((l) => ({
              value: l.value.toString(),
              label: l.text,
            })) ?? []
          }
          placeholder="Select fan speed"
        />
      );

    default:
      return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ControllerProps {
  features: FeatureValue[];
  onChangeValue: (featureId: string, value: number) => void;
  onSend: () => void;
  isSending: boolean;
}

export function ControllerFeature({
  features,
  onChangeValue,
  onSend,
  isSending,
}: ControllerProps) {
  if (features.length === 0) return null;

  return (
    <section className={styles['detail-section']}>
      <div
        className={`${styles['section-header']} ${styles['section-header--spaced']}`}
      >
        <div className={styles['section-header-left']}>
          <div className={styles['section-icon']}>
            <IconToggleLeft size={16} stroke={1.5} />
          </div>
          <Title order={2} size="h3" c="orange">
            Controls
          </Title>
        </div>
        <div className={styles['section-header-actions']}>
          <Button
            leftSection={<IconSend size={18} />}
            onClick={onSend}
            color="orange"
            variant="filled"
            loading={isSending}
          >
            Send Commands
          </Button>
        </div>
      </div>

      <div className={styles['controls-list']}>
        {features.map((feature) => (
          <Paper
            key={feature.featureUuid}
            className={styles['control-card'] ?? ''}
            p="lg"
            radius="md"
            withBorder
          >
            <div className={styles['control-card-header']}>
              <Text fw={600} size="sm" tt="capitalize">
                {feature.name}
              </Text>
              <Text size="xs" c="dimmed">
                Updated {getPrettyDateFromUnixEpoch(feature.modifiedAt)}
              </Text>
            </div>
            <ControlInput feature={feature} onChangeValue={onChangeValue} />
          </Paper>
        ))}
      </div>
    </section>
  );
}
