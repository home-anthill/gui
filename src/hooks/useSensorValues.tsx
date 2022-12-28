import { Device } from '../models/device';
import { SensorWithValue, useGetSensorValuesQuery } from '../services/sensorvalues';

export function useSensorValues(sensor: Device) {
  const {
    data: sensorWithValues = {} as SensorWithValue,
    isLoading: sensorWithValuesLoading,
    error: sensorWithValuesError
  } = useGetSensorValuesQuery(sensor);

  const loading = sensorWithValuesLoading;

  return {
    sensorWithValues,
    loading,
    sensorWithValuesError
  }
}
