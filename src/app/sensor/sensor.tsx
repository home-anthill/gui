import { useLocation } from 'react-router-dom';

import { Typography } from '@mui/material';

import styles from './sensor.module.scss';

import { useSensorValues } from '../../hooks/useSensorValues';
import SensorValue, { FeatureValue } from './sensorvalue/sensorvalue';

export function Sensor() {
  const {state} = useLocation();
  const sensor = state.device;

  const {sensorWithValues, loading, sensorWithValuesError} = useSensorValues(sensor);

  return (
    <div className={styles['sensor-container']}>
      <Typography variant="h2" component="h1">
        Sensor
      </Typography>
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
                <SensorValue feature={feature}></SensorValue>
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
