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
  IconAdjustments,
} from '@tabler/icons-react';
import {
  Device,
  Feature,
  HomeWithDevices,
  RoomWithDevices,
} from '../../../models/device';
import { Online } from '../../../models/online';
import { useOnline } from '../../../hooks/useOnline';
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

const OFFLINE_THRESHOLD_MS = 60 * 1000;

function isOnline(online: Online | undefined): boolean {
  if (!online) {
    return false;
  }

  const modifiedAt = new Date(online.modifiedAt).getTime();
  const currentTime = new Date(online.currentTime).getTime();

  return modifiedAt >= currentTime - OFFLINE_THRESHOLD_MS;
}

function getFeatureSummary(features: Feature[]) {
  const sensors = features.filter(
    (f): f is Feature => f.type === 'sensor' && f.name !== 'online',
  );
  const hasControllers = features.some((f) => f.type === 'controller');
  return { sensors, hasControllers };
}

function DeviceCard({ device, home, room }: DeviceCardProps) {
  const navigate = useNavigate();
  const { sensors, hasControllers } = getFeatureSummary(device.features);
  const { online } = useOnline(device.id);
  const deviceOnline = isOnline(online);
  const onlineLabel = deviceOnline ? 'Online' : 'Offline';
  const hasFeatures = sensors.length > 0;

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
        <div className={styles['device-card-title-row']}>
          <Text className={styles['device-card-name'] ?? ''} fw={600} truncate>
            {device.name ? device.name : device.mac}
          </Text>
          <Tooltip label={onlineLabel} withArrow>
            <span
              className={`${styles['device-card-online-dot']} ${
                deviceOnline
                  ? styles['device-card-online-dot-online']
                  : styles['device-card-online-dot-offline']
              }`}
              aria-label={onlineLabel}
              role="status"
            />
          </Tooltip>
        </div>

        <div className={styles['device-card-meta-row']}>
          <Text className={styles['device-card-mac'] ?? ''}>{device.mac}</Text>
          {hasControllers && (
            <div className={styles['device-card-ctrl-badge']}>
              <IconAdjustments size={10} stroke={2.5} />
              <span>Ctrl</span>
            </div>
          )}
        </div>

        {/* Feature icons */}
        {hasFeatures && (
          <div className={styles['device-card-features']}>
            {sensors.map((feature) => {
              const IconComponent = sensorIcons[feature.name];
              const label = sensorLabels[feature.name] ?? feature.name;
              return IconComponent ? (
                <Tooltip key={feature.uuid} label={label} withArrow>
                  <div className={styles['device-card-feat-icon']}>
                    <IconComponent size={26} stroke={1.6} />
                  </div>
                </Tooltip>
              ) : null;
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

const DeviceCardMemo = memo(DeviceCard);
export { DeviceCardMemo as DeviceCard };
