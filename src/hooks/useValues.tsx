import { Device } from '../models/device';
import { DeviceWithValuesResponse, SetValueRequest } from '../models/value';
import {
  useGetValuesQuery,
  useLazyGetValuesQuery,
  useSetValuesMutation,
} from '../services/values';
import { useCallback } from 'react';
import { skipToken } from '@reduxjs/toolkit/query/react';

export function useValues(device: Device | undefined) {
  const {
    data: deviceWithValues = {} as DeviceWithValuesResponse,
    isLoading: deviceWithValuesLoading,
    error: deviceWithValuesError,
  } = useGetValuesQuery(device ?? skipToken);

  const [
    trigger,
    {
      data: lazyDeviceWithValues = {} as DeviceWithValuesResponse,
      isLoading: lazyDeviceWithValuesLoading,
      error: lazyDeviceWithValuesError,
    },
  ] = useLazyGetValuesQuery();

  const [setValuesMutation, { isLoading: setValuesLoading }] =
    useSetValuesMutation();

  const loading = deviceWithValuesLoading || setValuesLoading;

  const setValues = useCallback(
    (deviceId: string, setValuesRequest: SetValueRequest[]) =>
      setValuesMutation({ deviceId, setValuesRequest }),
    [setValuesMutation]
  );

  return {
    deviceWithValues,

    trigger,
    lazyDeviceWithValues,
    lazyDeviceWithValuesLoading,
    lazyDeviceWithValuesError,

    loading,
    deviceWithValuesError,
    setValues,
  };
}
