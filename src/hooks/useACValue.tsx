import { useCallback } from 'react'

import { useLazyGetACValueQuery, useUpdateACValueMutation } from '../services/acvalue';
import { ACValue, ACValueStates } from '../models/acvalue';

export function useACValue() {
  const [trigger, {
    data: acValue = {} as ACValue,
    isLoading: acValueLoading,
    error: acValueError}
  ] = useLazyGetACValueQuery();

  const [updateACValueMutation, {isLoading: updateACValueLoading}] = useUpdateACValueMutation();

  const loading = acValueLoading || updateACValueLoading;

  const updateACValue = useCallback(
    (deviceId: string, acValueReq: ACValueStates) => updateACValueMutation({deviceId, acValueReq}),
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
