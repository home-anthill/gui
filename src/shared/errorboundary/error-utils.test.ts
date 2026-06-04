import { describe, expect, it } from 'vitest';

import { getErrorMessage, isAssetLoadError } from './error-utils';

describe('error-utils', () => {
  it('detects Vite CSS preload failures', () => {
    expect(
      isAssetLoadError(
        new Error('Unable to preload CSS for /assets/devices-D1X3ylwX.css'),
      ),
    ).toBe(true);
  });

  it('detects dynamic import failures', () => {
    expect(
      isAssetLoadError(
        new Error('Failed to fetch dynamically imported module'),
      ),
    ).toBe(true);
  });

  it('does not classify generic errors as asset load failures', () => {
    expect(isAssetLoadError(new Error('Unexpected render failure'))).toBe(
      false,
    );
  });

  it('extracts messages from errors and strings', () => {
    expect(getErrorMessage(new Error('Error message'))).toBe('Error message');
    expect(getErrorMessage('String message')).toBe('String message');
    expect(getErrorMessage({ message: 'Ignored object message' })).toBe('');
  });
});
