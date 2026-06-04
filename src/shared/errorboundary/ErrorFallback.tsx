import { Button, Center, Stack, Text, Title } from '@mantine/core';

import { isAssetLoadError } from './error-utils';

interface ErrorFallbackProps {
  error?: unknown;
}

export function ErrorFallback({ error }: ErrorFallbackProps) {
  const isRecoverableAssetError = isAssetLoadError(error);

  return (
    <Center h="100vh" px="md">
      <Stack align="center" gap="md" ta="center">
        <Title order={2} c="white">
          {isRecoverableAssetError ? 'Update needed' : 'Something went wrong'}
        </Title>
        <Text c="dimmed" size="sm">
          {isRecoverableAssetError
            ? 'The app files changed while this page was open. Reload to load the current version.'
            : 'An unexpected error occurred. Please reload the page.'}
        </Text>
        <Button
          color="orange"
          variant="light"
          onClick={() => window.location.reload()}
        >
          Reload
        </Button>
      </Stack>
    </Center>
  );
}
