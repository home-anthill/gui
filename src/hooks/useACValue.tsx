import { useCallback } from 'react'

import { useLazyGetACValueQuery, useUpdateACValueMutation } from '../services/acvalue';
import { ACValue } from '../models/acvalue';

export function useACValue() {
  const [trigger, {
    data: acValue = {} as ACValue,
    isLoading: acValueLoading,
    error: acValueError}
  ] = useLazyGetACValueQuery();

  const [updateACValueMutation, {isLoading: updateACValueLoading}] = useUpdateACValueMutation();

  const loading = acValueLoading || updateACValueLoading;

  const updateACValue = useCallback(
    (deviceId: string, acValue: ACValue) => updateACValueMutation({deviceId, acValue}),
    [updateACValueMutation]
  );

  return {
    trigger,
    acValue,
    loading,
    acValueError,
    updateACValue
  }
}
