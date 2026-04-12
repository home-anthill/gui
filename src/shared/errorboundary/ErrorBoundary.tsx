import { Component, ReactNode } from 'react';
import { Title, Text, Button, Center, Stack } from '@mantine/core';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Center h="100vh">
          <Stack align="center" gap="md">
            <Title order={2} c="white">
              Something went wrong
            </Title>
            <Text c="dimmed" size="sm">
              An unexpected error occurred. Please reload the page.
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
    return this.props.children;
  }
}

export default ErrorBoundary;