import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Title,
  Text,
  Paper,
  Button,
  Avatar,
  Divider,
  CopyButton,
  ActionIcon,
  Tooltip,
  Modal,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCheck,
  IconCopy,
  IconEyeOff,
  IconKey,
  IconLogout,
} from '@tabler/icons-react';
import { toast } from 'sonner';

import { logError } from '../../utils/logger';

import { useProfile } from '../../hooks/useProfile';
import { ProfileTokenResponse } from '../../models/profile';
import { removeToken } from '../../auth/auth-utils';

import styles from './profile.module.scss';

const MASKED_TOKEN = '********-****-****-****-************';

export function Profile() {
  const { profile, newProfileToken, logout } = useProfile();
  const navigate = useNavigate();
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function regenerateApiToken() {
    if (!profile) {
      toast.error('Cannot regenerate API Token, Profile not found!');
      return;
    }
    try {
      const response: ProfileTokenResponse = await newProfileToken(
        profile.id,
      ).unwrap();
      setApiToken(response?.apiToken);
      setIsModalOpen(false);
      toast.success('API Token regenerated successfully');
    } catch (err) {
      logError('Cannot re-generate API Token', err);
    }
  }

  async function handleLogout() {
    try {
      await logout().unwrap();
    } catch (err) {
      logError('Cannot logout on server-side', err);
    } finally {
      removeToken();
      toast.info('Logged out');
      navigate('/login');
    }
  }

  return (
    <div className={styles['profile-page']}>
      <div className={styles['profile-page-heading']}>
        <Title order={1} c="white">
          Profile
        </Title>
        <Text c="dimmed" size="sm" mt="xs">
          Manage your account
        </Text>
      </div>

      <Paper className={styles['profile-card'] ?? ''} p="xl" radius="md" withBorder>
        <div className={styles['profile-card-inner']}>
          <Avatar
            size={120}
            radius="xl"
            color="orange"
            alt="profile icon"
            src={profile?.github?.avatarURL ?? ''}
          ></Avatar>

          <div className={styles['profile-card-name']}>
            <Text size="xl" fw={600} c="white">
              {profile?.github?.name}
            </Text>
            <Text size="sm" c="dimmed">
              {profile?.github?.email}
            </Text>
          </div>

          <Divider style={{ width: '100%' }} />

          <div className={styles['profile-card-section']}>
            <Text size="lg" fw={600} mb="xs">
              API Token
            </Text>

            {/* Token display row — always visible */}
            <div className={styles['token-display-row']}>
              <Text
                size="sm"
                className={styles['token-display-text'] ?? ''}
                style={{ fontFamily: 'monospace', textAlign: 'center' }}
                c={apiToken ? 'white' : 'dimmed'}
              >
                {apiToken ?? MASKED_TOKEN}
              </Text>

              {apiToken && (
                <>
                  <CopyButton value={apiToken}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied!' : 'Copy token'}>
                        <ActionIcon
                          color={copied ? 'teal' : 'orange'}
                          variant="subtle"
                          onClick={copy}
                          size="sm"
                          aria-label="Copy API token"
                        >
                          {copied ? (
                            <IconCheck size={15} />
                          ) : (
                            <IconCopy size={15} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                  <Tooltip label="Hide token">
                    <ActionIcon
                      color="gray"
                      variant="subtle"
                      onClick={() => setApiToken(null)}
                      size="sm"
                      aria-label="Hide API token"
                    >
                      <IconEyeOff size={15} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}
            </div>

            {/* Regenerate button — always the same */}
            <Button
              leftSection={<IconKey size={18} />}
              onClick={() => setIsModalOpen(true)}
              color="orange"
              variant="light"
              fullWidth
              mt="xs"
            >
              Regenerate API Token
            </Button>

            <Text size="xs" c="dimmed" mt="xs">
              Use this API token in firmwares
            </Text>
          </div>

          <Divider style={{ width: '100%' }} />

          <Button
            leftSection={<IconLogout size={18} />}
            onClick={handleLogout}
            color="red"
            variant="light"
            fullWidth
          >
            Logout
          </Button>
        </div>
      </Paper>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconAlertTriangle
              size={24}
              color="var(--mantine-color-orange-5)"
            />
            <Text fw={600} size="lg">
              Critical Operation Warning
            </Text>
          </div>
        }
        centered
        size="md"
      >
        <Text size="sm" mb="md">
          Regenerating your API token is a <strong>critical operation</strong>{' '}
          that will immediately invalidate all connected IoT devices.
        </Text>
        <Text size="sm" mb="md">
          After regeneration, you will need to{' '}
          <strong>manually reprogram each device</strong> one by one with the
          new token to restore connectivity.
        </Text>
        <Text size="sm" mb="xl" c="orange" fw={500}>
          Are you sure you want to proceed?
        </Text>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="light"
            color="gray"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="orange"
            onClick={regenerateApiToken}
            leftSection={<IconKey size={18} />}
          >
            Confirm & Regenerate
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Profile;
