import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';

import { useDevices } from '../../hooks/useDevices';
import DeviceCard from './devicecard/deviceCard';

import styles from './devices.module.scss';

export function Devices() {
  const navigate = useNavigate();
  // get devices in a object where devices are grouped by homes and rooms and
  // are separated by their types (controllers or sensors) in an array called `homeDevices`.
  // Devices that are not assigned are defined in `unassignedDevices` array
  const { homeDevices, loading, error } = useDevices();

  function showDeviceSettings(device: any) {
    if (!device) {
      console.error(`Cannot show settings - 'id' is missing`);
      return;
    }
    navigate(`/main/devices/${device.id}`, {state: {device}});
  }

  function showController(device: any) {
    if (!device) {
      console.error(`Cannot open controller - 'id' is missing`);
      return;
    }
    navigate(`/main/devices/${device.id}/controller`, {state: {device}});
  }

  function showSensor(device: any) {
    if (!device) {
      console.error(`Cannot open sensor - 'id' is missing`);
      return;
    }
    navigate(`/main/devices/${device.id}/sensor`, {state: {device}});
  }

  function isController(device: any) {
    return device.features.find((feature: any) => feature.type === 'controller') !== undefined;
  }

  function hasDevices(devicesResult: any) {
    return devicesResult && ((devicesResult.homeDevices && devicesResult.homeDevices.length > 0)
      || (devicesResult.unassignedDevices && devicesResult.unassignedDevices.length > 0));
  }

  return (
    <div className={styles['DevicesContainer']}>
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
              <div className={styles['HomeContainer']}>
                <Typography variant="h5" component="h1">
                  Unassigned
                </Typography>
                <div className={styles['FeaturesContainer']}>
                  {homeDevices.unassignedDevices.map((device: any) => (
                    <DeviceCard key={device.id}
                                device={device}
                                deviceType={isController(device) ? 'controller' : 'sensor'}
                                onShowController={() => showController(device)}
                                onShowSensor={() => showSensor(device)}
                                onShowSettings={() => showDeviceSettings(device)}></DeviceCard>
                  ))}
                </div>
              </div>
              <div className={styles['DevicesDivider']}></div>
            </>
          }
          {homeDevices.homeDevices.map((home: any) => (
            <div key={home.name + home.location}>
              <div className={styles['HomeContainer']}>
                <Typography variant="h5" component="h1">
                  { home.name } ({ home.location })
                </Typography>
                <br />
                {home.rooms.map((room: any) => (
                  <div className={styles['RoomContainer']} key={room.name + room.floor}>
                    <Typography variant="h6" component="h2">
                      { room.name } - { room.floor }
                    </Typography>
                    {(room.controllerDevices.length > 0 || room.sensorDevices.length > 0) ? (
                      <>
                        <div className={styles['FeaturesContainer']}>
                          {room.controllerDevices.map((controller: any) => (
                            <DeviceCard key={controller.id}
                                        device={controller}
                                        deviceType={'controller'}
                                        onShowController={() => showController(controller)}
                                        onShowSettings={() => showDeviceSettings(controller)}
                                        onShowSensor={() => ({})}></DeviceCard>
                          ))}
                        </div>
                        <div className={styles['FeaturesContainer']}>
                          {room.sensorDevices.map((sensor: any) => (
                            <DeviceCard key={sensor.id}
                                        device={sensor}
                                        deviceType={'sensor'}
                                        onShowSensor={() => showSensor(sensor)}
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
              <div className={styles['DevicesDivider']}></div>
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
