const assetErrorPatterns = [
  /unable to preload css/i,
  /failed to fetch dynamically imported module/i,
  /importing a module script failed/i,
  /loading chunk \d+ failed/i,
  /chunkloaderror/i,
];

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return '';
}

export function isAssetLoadError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return assetErrorPatterns.some((pattern) => pattern.test(message));
}
