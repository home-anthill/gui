import { useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';

import { useSensorValues } from '../../hooks/useSensorValues';
import SensorValue from './sensorvalue/sensorvalue';
import { Device, HomeWithDevices, RoomSplitDevices } from '../../models/device';
import { FeatureValue } from '../../models/value';

import styles from './sensor.module.scss';

export function Sensor() {
  const {state} = useLocation();
  const sensor: Device = state.device;
  const home: HomeWithDevices | undefined = state.home;
  const room: RoomSplitDevices | undefined = state.room;

  const {sensorWithValues, loading, sensorWithValuesError} = useSensorValues(sensor);

  return (
    <div className={styles['sensor-container']}>
      <Typography variant="h2" component="h1">
        Sensor
      </Typography>
      <div className={styles['sensor-home-info']}>
        <Typography variant="body1" component="p">
          {home?.name} {home?.location && (home?.location)} {(room?.name || room?.floor) && '-'} {room?.name} {room?.floor && (room?.floor)}
        </Typography>
      </div>
      <div className={styles['sensor']}>
        <Typography variant="h5" component="h2">
          {sensorWithValues?.mac}
        </Typography>
        <Typography variant="subtitle1" component="h3">
          {sensorWithValues?.manufacturer} - {sensorWithValues?.model}
        </Typography>
        {sensorWithValuesError && <div className="error">Something went wrong</div>}
        {loading && <div className="loading">Loading...</div>}
        {sensorWithValues ? (
          <div className={styles['sensor-features-container']}>
            {sensorWithValues?.features?.map((feature: FeatureValue) => (
              <div className={styles['feature-value']} key={feature?.uuid}>
                <SensorValue id={sensor.id} feature={feature}></SensorValue>
              </div>
            ))}
          </div>
        ) : (
          'No data to show'
        )}
      </div>
    </div>
  );
}

export default Sensor;
