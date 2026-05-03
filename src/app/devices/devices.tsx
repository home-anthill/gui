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

  // function showDeviceSettings(device: Device): void {
  //   navigate(`/main/devices/${device.id}`, { state: { device } });
  // }
  //
  // function showDevice(
  //   device: Device,
  //   home: HomeWithDevices | undefined,
  //   room: RoomWithDevices | undefined,
  // ): void {
  //   if (home && room) {
  //     navigate(`/main/devices/${device.id}/features`, {
  //       state: { device, home, room },
  //     });
  //     return;
  //   } else {
  //     navigate(`/main/devices/${device.id}/features`, { state: { device } });
  //     return;
  //   }
  // }
  //
  // function hasDevices(devicesResult: DevicesResponse): boolean {
  //   return (
  //     devicesResult &&
  //     ((devicesResult.homeDevices && devicesResult.homeDevices.length > 0) ||
  //       (devicesResult.unassignedDevices &&
  //         devicesResult.unassignedDevices.length > 0))
  //   );
  // }

  if (loading) {
    return (
      <div className={styles['page-loading']}>
        <Loader color="orange" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['home-page']}>
        <Alert icon={<IconAlertCircle size={18} />} color="red" title="Error">
          Unable to load devices.
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles['home-page']}>
      <div className={styles['page-header']}>
        <Title order={1} c="white">
          Devices
        </Title>
        <Text c="dimmed" size="sm" mt="xs">
          Manage all your smart devices from one place
        </Text>
      </div>

      {/* ── Unassigned Devices ───────────────────────────────────────────── */}
      {homeDevices.unassignedDevices.length > 0 && (
        <section className={styles['device-section']}>
          <Title order={2} size="h3" c="orange" mb="md">
            Unassigned Devices
          </Title>
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
          <div className={styles['home-title']}>
            <div className={styles['home-title-icon']}>
              <IconHome size={18} stroke={1.5} />
            </div>
            <Title order={2} size="h2" c="white">
              {home.name} ({home.location})
            </Title>
          </div>

          {/* Rooms */}
          {home.rooms.map((room: RoomWithDevices) => (
            <div key={room.id} className={styles['room-block']}>
              <div className={styles['room-title']}>
                <div className={styles['room-title-icon']}>
                  <IconDoor size={14} stroke={1.5} />
                </div>
                <Title order={3} size="h4" c="orange">
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
