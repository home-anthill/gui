const reloadAttemptedKey = 'home-anthill:preload-reload-attempted';

function hasAlreadyReloaded(): boolean {
  try {
    return sessionStorage.getItem(reloadAttemptedKey) === 'true';
  } catch {
    return false;
  }
}

function markReloadAttempted(): void {
  try {
    sessionStorage.setItem(reloadAttemptedKey, 'true');
  } catch {
    // Reload recovery should still work when storage is unavailable.
  }
}

export function installPreloadErrorHandler() {
  const handlePreloadError = (event: Event) => {
    event.preventDefault();

    if (hasAlreadyReloaded()) {
      return;
    }

    markReloadAttempted();
    window.location.reload();
  };

  window.addEventListener('vite:preloadError', handlePreloadError);

  return () => {
    window.removeEventListener('vite:preloadError', handlePreloadError);
  };
}
