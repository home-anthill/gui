import { Title, Text, Button } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';

import styles from './notfoundpage.module.scss';

export function NotFoundPage() {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className={styles['not-found-page']}>
      <div className={styles['not-found-page__content']}>
        <Title order={1} size={80} c="orange" fw={900}>
          404
        </Title>
        <Title order={2} size="h2" c="white" mt="md">
          Page not found
        </Title>
        <Text c="dimmed" size="lg" mt="md">
          The page you are looking for does not exist or has been moved.
        </Text>
        <Button
          leftSection={<IconHome size={18} />}
          onClick={handleGoHome}
          color="orange"
          size="lg"
          mt="xl"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
