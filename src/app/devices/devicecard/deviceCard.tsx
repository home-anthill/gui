import { memo } from 'react';
import { Card, Text, Tooltip } from '@mantine/core';
import { useNavigate } from 'react-router';
import {
  IconThermometer,
  IconDroplet,
  IconGauge,
  IconEye,
  IconSun,
  IconLeaf,
  IconBolt,
  IconAdjustments,
} from '@tabler/icons-react';
import {
  Device,
  Feature,
  HomeWithDevices,
  RoomWithDevices,
} from '../../../models/device';
import styles from './deviceCard.module.scss';

interface DeviceCardProps {
  device: Device;
  home?: HomeWithDevices;
  room?: RoomWithDevices;
}

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

const sensorLabels: Record<string, string> = {
  temperature: 'Temperature',
  humidity: 'Humidity',
  airpressure: 'Air pressure',
  motion: 'Motion',
  light: 'Light',
  airquality: 'Air quality',
};

function getFeatureSummary(features: Feature[]) {
  const sensors = features.filter((f): f is Feature => f.type === 'sensor');
  const hasControllers = features.some((f) => f.type === 'controller');
  const onlineFeatures = features.filter(
    (f): f is Feature => f.type === 'sensor' && f.name === 'online',
  );
  return { sensors, hasControllers, onlineFeatures };
}

function DeviceCard({ device, home, room }: DeviceCardProps) {
  const navigate = useNavigate();
  const { sensors, hasControllers, onlineFeatures } = getFeatureSummary(
    device.features,
  );
  const hasFeatures = sensors.length > 0 || onlineFeatures.length > 0;

  function showDeviceDetails(): void {
    if (home && room) {
      navigate(`/devices/${device.id}`, {
        state: { device, home, room },
      });
      return;
    } else {
      navigate(`/devices/${device.id}`, { state: { device } });
      return;
    }
  }

  return (
    <Card
      className={styles['device-card'] ?? ''}
      padding={0}
      radius="md"
      withBorder
      onClick={showDeviceDetails}
    >
      {/* Body */}
      <div className={styles['device-card-body']}>
        {/* Name row + controllable badge */}
        <div className={styles['device-card-title-row']}>
          <Text className={styles['device-card-name'] ?? ''} fw={600} truncate>
            {device.name ? device.name : device.mac}
          </Text>
          {hasControllers && (
            <div className={styles['device-card-ctrl-badge']}>
              <IconAdjustments size={10} stroke={2.5} />
              <span>Ctrl</span>
            </div>
          )}
        </div>

        {/* MAC address */}
        <Text className={styles['device-card-mac'] ?? ''}>{device.mac}</Text>

        {/* Feature icons */}
        {hasFeatures && (
          <div className={styles['device-card-features']}>
            {sensors.map((feature) => {
              const IconComponent = sensorIcons[feature.name];
              const label = sensorLabels[feature.name] ?? feature.name;
              return IconComponent ? (
                <Tooltip key={feature.uuid} label={label} withArrow>
                  <div className={styles['device-card-feat-icon']}>
                    <IconComponent size={15} stroke={1.8} />
                  </div>
                </Tooltip>
              ) : null;
            })}
            {onlineFeatures.map((feature) => (
              <Tooltip key={feature.uuid} label={feature.name} withArrow>
                <div className={styles['device-card-feat-icon']}>
                  <IconBolt size={15} stroke={1.8} />
                </div>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

const DeviceCardMemo = memo(DeviceCard);
export { DeviceCardMemo as DeviceCard };
