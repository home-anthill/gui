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
import { getPrettyDateFromDateString, getPrettyDateFromUnixEpoch } from '../../../utils/dateUtils';

import styles from './controller.module.scss';

// ─── Constants ────────────────────────────────────────────────────────────────

const MODES = [
  { value: '1', label: 'Cool' },
  { value: '2', label: 'Auto' },
  { value: '3', label: 'Heat' },
  { value: '4', label: 'Fan' },
  { value: '5', label: 'Dry' },
];

const FAN_SPEEDS = [
  { value: '1', label: 'Min' },
  { value: '2', label: 'Med' },
  { value: '3', label: 'Max' },
  { value: '4', label: 'Auto' },
  { value: '5', label: 'Auto0' },
];

// ─── ControlInput ─────────────────────────────────────────────────────────────

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
            onChangeValue(
              feature.featureUuid,
              e.currentTarget.checked ? 1 : 0,
            )
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
            <Text size="sm" c="dimmed">17</Text>
            <Text fw={600} c="orange">{feature.value}°C</Text>
            <Text size="sm" c="dimmed">30</Text>
          </div>
          <Slider
            value={feature.value as number}
            onChange={(value) => onChangeValue(feature.featureUuid, value)}
            min={17}
            max={30}
            step={1}
            color="orange"
            marks={[
              { value: 17, label: '17' },
              { value: 30, label: '30' },
            ]}
          />
        </div>
      );

    case 'tolerance':
      return (
        <div className={styles['slider-wrapper']}>
          <div className={styles['slider-labels']}>
            <Text size="sm" c="dimmed">0</Text>
            <Text fw={600} c="orange">{feature.value}</Text>
            <Text size="sm" c="dimmed">10</Text>
          </div>
          <Slider
            value={feature.value as number}
            onChange={(value) => onChangeValue(feature.featureUuid, value)}
            min={0}
            max={10}
            step={1}
            color="orange"
            marks={[
              { value: 0, label: '0' },
              { value: 10, label: '10' },
            ]}
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
          data={MODES}
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
          data={FAN_SPEEDS}
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
  lastSent: string;
  onChangeValue: (featureId: string, value: number) => void;
  onSend: () => void;
  isSending: boolean;
}

export function ControllerFeature({
  features,
  lastSent,
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

        {lastSent && (
          <Paper className={styles['info-card'] ?? ''} p="md" radius="md" withBorder>
            <div className={styles['info-card-row']}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Last command sent
              </Text>
              <Text size="sm">{getPrettyDateFromDateString(lastSent)}</Text>
            </div>
          </Paper>
        )}
      </div>
    </section>
  );
}
