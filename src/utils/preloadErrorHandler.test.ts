import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { installPreloadErrorHandler } from './preloadErrorHandler';

describe('installPreloadErrorHandler', () => {
  let cleanup: (() => void) | undefined;
  let reloadMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.clear();
    reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });
  });

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    vi.restoreAllMocks();
  });

  it('prevents the preload error and reloads once', () => {
    cleanup = installPreloadErrorHandler();
    const event = new Event('vite:preloadError', { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('does not reload repeatedly in the same browser tab', () => {
    cleanup = installPreloadErrorHandler();

    window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }));
    window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }));

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
