import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';

import { useDevices } from '../../hooks/useDevices';
import DeviceCard from './devicecard/deviceCard';
import { Device, DevicesResponse, Feature, HomeWithDevices, RoomSplitDevices } from '../../models/device';

import styles from './devices.module.scss';

export function Devices() {
  const navigate = useNavigate();
  // get devices in a object where devices are grouped by homes and rooms and
  // are separated by their types (controllers or sensors) in an array called `homeDevices`.
  // Devices that are not assigned are defined in `unassignedDevices` array
  const { homeDevices, loading, error } = useDevices();

  function showDeviceSettings(device: Device): void {
    if (!device) {
      console.error(`Cannot show settings - 'id' is missing`);
      return;
    }
    navigate(`/main/devices/${device.id}`, {state: {device}});
  }

  function showDevice(type: 'controller' | 'sensor', device: Device, home: HomeWithDevices | undefined, room: RoomSplitDevices | undefined): void {
    if (!device) {
      console.error(`Cannot open controller - 'id' is missing`);
      return;
    }
    if (home && room) {
      navigate(`/main/devices/${device.id}/${type}`, {state: {device, home, room}});
      return;
    } else {
      navigate(`/main/devices/${device.id}/${type}`, {state: {device}});
      return;
    }
  }

  function isController(device: Device): boolean {
    return device.features.find((feature: Feature) => feature.type === 'controller') !== undefined;
  }

  function hasDevices(devicesResult: DevicesResponse): boolean {
    return devicesResult && ((devicesResult.homeDevices && devicesResult.homeDevices.length > 0)
      || (devicesResult.unassignedDevices && devicesResult.unassignedDevices.length > 0));
  }

  return (
    <div className={styles['devices-container']}>
      <Typography variant="h2" component="h1" textAlign={'center'}>
        Devices
      </Typography>
      {error ? (
        <div className="error">Something went wrong</div>
      ) : loading ? (
        <div className="loading">Loading...</div>
      ) : hasDevices(homeDevices) ? (
        <>
          {homeDevices.unassignedDevices && homeDevices.unassignedDevices.length > 0 &&
            <>
              <div className={styles['home-container']}>
                <Typography variant="h5" component="h1">
                  Unassigned
                </Typography>
                <div className={styles['features-container']}>
                  {homeDevices.unassignedDevices.map((device: Device) => (
                    <DeviceCard key={device.id}
                                device={device}
                                deviceType={isController(device) ? 'controller' : 'sensor'}
                                onShowController={() => showDevice('controller', device, undefined, undefined)}
                                onShowSensor={() => showDevice('sensor', device, undefined, undefined)}
                                onShowSettings={() => showDeviceSettings(device)}></DeviceCard>
                  ))}
                </div>
              </div>
              <div className={styles['devices-divider']}></div>
            </>
          }
          {homeDevices.homeDevices.map((home: HomeWithDevices) => (
            <div key={home.name + home.location}>
              <div className={styles['home-container']}>
                <Typography variant="h5" component="h1">
                  { home.name } ({ home.location })
                </Typography>
                <br />
                {home.rooms.map((room: RoomSplitDevices) => (
                  <div className={styles['room-container']} key={room.name + room.floor}>
                    <Typography variant="h6" component="h2">
                      { room.name } - { room.floor }
                    </Typography>
                    {(room.controllerDevices.length > 0 || room.sensorDevices.length > 0) ? (
                      <>
                        <div className={styles['features-container']}>
                          {room.controllerDevices.map((controller: Device) => (
                            <DeviceCard key={controller.id}
                                        device={controller}
                                        deviceType={'controller'}
                                        onShowController={() => showDevice('controller', controller, home, room)}
                                        onShowSettings={() => showDeviceSettings(controller)}
                                        onShowSensor={() => ({})}></DeviceCard>
                          ))}
                        </div>
                        <div className={styles['features-container']}>
                          {room.sensorDevices.map((sensor: Device) => (
                            <DeviceCard key={sensor.id}
                                        device={sensor}
                                        deviceType={'sensor'}
                                        onShowSensor={() => showDevice('sensor', sensor, home, room)}
                                        onShowSettings={() => showDeviceSettings(sensor)}
                                        onShowController={() => ({})}></DeviceCard>
                          ))}
                        </div>
                      </>
                    ) : (
                      'No devices to show'
                    )}
                  </div>
                ))}
              </div>
              <div className={styles['devices-divider']}></div>
            </div>
          ))}
        </>
      ) : (
        'No data to show'
      )}
    </div>
  );
}

export default Devices;
