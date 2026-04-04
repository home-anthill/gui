import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderHookWithStore } from '../test-store';
import { useValues } from './useValues';
import { mockDevice } from '../test-fixtures';

describe('useValues (MSW)', () => {
  it('fetches device values and applies transformResponse', async () => {
    const { result } = renderHookWithStore(() => useValues(mockDevice));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const features = result.current.deviceWithValues.features;
    expect(features).toHaveLength(1);
    // The feature uuid comes from the device features list
    expect(features[0].featureUuid).toBe('f1');
    expect(features[0].name).toBe('temperature');
    expect(features[0].value).toBe(22.5);
    expect(features[0].type).toBe('sensor');
  });

  it('returns an empty features array when the device has no features', async () => {
    const deviceNoFeatures = { ...mockDevice, features: [] };
    const { result } = renderHookWithStore(() => useValues(deviceNoFeatures));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.deviceWithValues.features).toHaveLength(0);
  });

  it('calls POST /api/devices/:id/values via setValues mutation', async () => {
    const { result } = renderHookWithStore(() => useValues(mockDevice));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const response = await result.current.setValues('d1', [
      { featureUuid: 'f1', type: 'sensor', name: 'temperature', value: 25 },
    ]);
    expect((response as { data?: { message: string } }).data?.message).toBe(
      'ok',
    );
  });
});
