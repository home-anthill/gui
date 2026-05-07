import { Title, Text, Loader, Alert } from '@mantine/core';
import { IconAlertCircle, IconDoor, IconHome } from '@tabler/icons-react';

import { useDevices } from '../../hooks/useDevices';
import { DeviceCard } from './devicecard/deviceCard';
import {
  HomeWithDevices,
  RoomWithDevices,
} from '../../models/device';

import styles from './devices.module.scss';

export function Devices() {
  // get devices in a object where devices are grouped by homes and rooms in an array called `homeDevices`.
  // Devices that are not assigned are defined in `unassignedDevices` array
  const { homeDevices, loading, error } = useDevices();

  if (loading) {
    return (
      <div className={styles['page-loading']}>
        <Loader color="orange" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['devices-page']}>
        <Alert icon={<IconAlertCircle size={18} />} color="red" title="Error">
          Unable to load devices.
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles['devices']}>
      <div className={styles['devices-header']}>
        <Title order={1} className={styles['devices-header-title'] ?? ''}>
          Devices
        </Title>
        <Text
          size="sm"
          mt="xs"
          className={styles['devices-header-subtitle'] ?? ''}
        >
          Manage all your smart devices from one place
        </Text>
      </div>

      {/* ── Unassigned Devices ───────────────────────────────────────────── */}
      {homeDevices.unassignedDevices.length > 0 && (
        <section className={styles['devices-section']}>
          {/* Unassigned title */}
          <div className={styles['devices-title']}>
            <div className={styles['devices-title-icon']}>
              <IconHome size={28} stroke={1.5} />
            </div>
            <Title
              order={2}
              size="h3"
              className={styles['devices-title-text'] ?? ''}
            >
              Unassigned Devices
            </Title>
          </div>
          <div className={styles['devices-grid']}>
            {homeDevices.unassignedDevices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        </section>
      )}

      {/* ── Homes ────────────────────────────────────────────────────────── */}
      {homeDevices.homeDevices.map((home: HomeWithDevices) => (
        <section key={home.id} className={styles['home-section']}>
          {/* Home title */}
          <div className={styles['homedevices-title']}>
            <div className={styles['homedevices-title-icon']}>
              <IconHome size={28} stroke={1.5} />
            </div>
            <Title
              order={2}
              size="h3"
              className={styles['homedevices-title-text'] ?? ''}
            >
              {home.name} ({home.location})
            </Title>
          </div>

          {/* Rooms */}
          {home.rooms.map((room: RoomWithDevices) => (
            <div key={room.id} className={styles['room-section']}>
              <div className={styles['room-title']}>
                <div className={styles['room-title-icon']}>
                  <IconDoor size={22} stroke={1.5} />
                </div>
                <Title
                  order={3}
                  size="h4"
                  className={styles['room-title-text'] ?? ''}
                >
                  {room.name} ({room.floor})
                </Title>
              </div>
              <div className={styles['devices-grid']}>
                {room.devices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    home={home}
                    room={room}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      {homeDevices.homeDevices.length === 0 && (
        <p className={styles['empty-message']}>
          No devices found assigned to homes
        </p>
      )}
    </div>
  );
}

export default Devices;
