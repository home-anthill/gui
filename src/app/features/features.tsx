import { useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';

import { Device, HomeWithDevices, RoomWithDevices } from '../../models/device';
import { FeatureValue } from '../../models/value';
import { useValues } from '../../hooks/useValues';
import SensorValue from './featuresvalues/sensorvalue';
import ControllerValues from './featuresvalues/controllervalues';

import styles from './features.module.scss';

export function Features() {
  const { state } = useLocation();
  const device: Device = state.device;
  const home: HomeWithDevices | undefined = state.home;
  const room: RoomWithDevices | undefined = state.room;

  const { deviceWithValues, loading, deviceWithValuesError } =
    useValues(device);

  return (
    <div className={styles['features-container']}>
      <Typography variant="h2" component="h1">
        Device
      </Typography>
      <div className={styles['features-device-home-info']}>
        <Typography variant="body1" component="p">
          {home?.name} {home?.location && home?.location}{' '}
          {(room?.name || room?.floor) && '-'} {room?.name}{' '}
          {room?.floor && room?.floor}
        </Typography>
      </div>
      <div className={styles['features-device']}>
        <Typography variant="h5" component="h2">
          {deviceWithValues?.mac}
        </Typography>
        <Typography variant="subtitle1" component="h3">
          {deviceWithValues?.manufacturer} - {deviceWithValues?.model}
        </Typography>
        {deviceWithValuesError && (
          <div className="error">Something went wrong</div>
        )}
        {loading && <div className="loading">Loading...</div>}
        {deviceWithValues ? (
          <>
            <div className={styles['features-sensor-container']}>
              {deviceWithValues?.features
                ?.filter((feature: FeatureValue) => feature.type === 'sensor')
                .map((feature: FeatureValue) => (
                  <div
                    className={styles['features-value']}
                    key={feature?.featureUuid}
                  >
                    <SensorValue id={device.id} feature={feature}></SensorValue>
                  </div>
                ))}
            </div>

            <ControllerValues deviceWithValues={deviceWithValues} />
          </>
        ) : (
          'No data to show'
        )}
      </div>
    </div>
  );
}

export default Features;
