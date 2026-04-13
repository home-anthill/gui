import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router';
import {
  Title,
  Text,
  Paper,
  Button,
  Select,
  Loader,
  Alert,
  Modal,
  ActionIcon,
  Tooltip,
  TextInput,
  Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconDevices,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import { toast } from 'sonner';

import { logError } from '../../utils/logger';

import { Device, HomeWithDevices, RoomWithDevices } from '../../models/device';
import { useValues } from '../../hooks/useValues';
import { useHomes } from '../../hooks/useHomes';
import { useDevices } from '../../hooks/useDevices';
import { Sensor } from './features/sensor';
import { Online } from './features/online';
import { ControllerFeature } from './features/controller';

import styles from './devicedetail.module.scss';

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DeviceDetail() {
  const { state } = useLocation();
  const device: Device | undefined = state?.device;
  const home: HomeWithDevices | undefined = state?.home;
  const room: RoomWithDevices | undefined = state?.room;
  const navigate = useNavigate();

  const { homes } = useHomes();

  const { assignDeviceHomeRoom, deleteDevice } = useDevices();
  const {
    deviceWithValues,
    loading,
    deviceWithValuesError,
    setValues,
    isSending,
  } = useValues(device, { skip: !device });

  const [localOverrides, setLocalOverrides] = useState<Record<string, number>>(
    {},
  );
  const { sensorFeatures, onlineFeatures, controllerFeatures } =
    useMemo(() => {
      const all = (deviceWithValues?.features ?? []).map((f) => ({
        ...f,
        value: localOverrides[f.featureUuid] ?? f.value,
      }));
      return {
        sensorFeatures: all.filter((f) => f.type === 'sensor' && f.name !== 'online'),
        onlineFeatures: all.filter((f) => f.type === 'sensor' && f.name === 'online'),
        controllerFeatures: all.filter((f) => f.type === 'controller'),
      };
    }, [deviceWithValues, localOverrides]);

  const [settingsOpened, settingsHandlers] = useDisclosure(false);
  const [deleteOpened, deleteHandlers] = useDisclosure(false);
  const [deviceName, setDeviceName] = useState('');
  const [selectedHome, setSelectedHome] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const homeOptions = useMemo(
    () => homes.map((h) => ({ value: h.id, label: h.name })),
    [homes],
  );

  const roomOptions = useMemo(
    () =>
      homes
        .find((h) => h.id === selectedHome)
        ?.rooms.map((r) => ({ value: r.id, label: r.name })) ?? [],
    [homes, selectedHome],
  );

  if (loading) {
    return (
      <div className="page-loading">
        <Loader color="orange" size="lg" />
      </div>
    );
  }

  if (deviceWithValuesError || !device) {
    return (
      <div className={styles['device-detail-page']}>
        <Alert
          icon={<IconAlertCircle size={18} />}
          color="red"
          title="Device not found"
          mb="md"
        >
          The requested device does not exist or is not reachable.
        </Alert>
        <Button onClick={() => navigate('/')} variant="light" color="orange">
          Back to Devices
        </Button>
      </div>
    );
  }

  const handleControlChange = (featureUuid: string, value: number) => {
    setLocalOverrides((prev) => ({ ...prev, [featureUuid]: value }));
  };

  const handleSendControls = async () => {
    try {
      await setValues(device.id, controllerFeatures).unwrap();
      setLocalOverrides({});
      toast.success('Commands sent successfully');
    } catch (err) {
      logError('Cannot send commands', err);
    }
  };

  const handleOpenSettings = () => {
    setDeviceName(device.name || device.mac);
    setSelectedHome(home?.id ?? null);
    setSelectedRoom(room?.id ?? null);
    settingsHandlers.open();
  };

  const handleSaveSettings = async () => {
    if (deviceName.trim() === '') {
      toast.error('Name cannot be empty');
      return;
    }
    if (!device || !selectedHome || !selectedRoom) {
      toast.error('Cannot assign device');
      return;
    }
    try {
      await assignDeviceHomeRoom(
        device.id,
        deviceName.trim(),
        selectedHome,
        selectedRoom,
      );
      toast.success('Settings saved');
      settingsHandlers.close();
      navigate('/');
    } catch (err) {
      logError('Cannot save settings', err);
    }
  };

  const handleDeleteDevice = async () => {
    try {
      await deleteDevice(device.id);
      toast.success('Device deleted');
      navigate('/');
    } catch (err) {
      logError('Cannot delete device', err);
    }
  };

  return (
    <div className={styles['device-detail-page']}>
      <Button
        leftSection={<IconArrowLeft size={18} />}
        variant="subtle"
        color="gray"
        onClick={() => navigate('/')}
        mb="lg"
      >
        Back to Devices
      </Button>

      {/* Header */}
      <Paper
        className={styles['device-header'] ?? ''}
        radius="md"
        withBorder
        mb="xl"
      >
        <div className={styles['device-header-inner']}>
          <div className={styles['device-header-icon']}>
            <IconDevices
              size={64}
              stroke={1.5}
              color="var(--mantine-color-orange-6)"
            />
          </div>
          <div className={styles['device-header-info']}>
            <div className={styles['device-header-title']}>
              <Title order={1} size="h2" c="white">
                {device.name ?? device.mac}
              </Title>
            </div>
          </div>
          <Tooltip label="Settings">
            <ActionIcon
              variant="light"
              color="orange"
              size="lg"
              onClick={handleOpenSettings}
              aria-label="Device settings"
            >
              <IconSettings size={20} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </div>

        <Divider
          style={{ width: '100%', marginTop: '1rem', marginBottom: '1rem' }}
        />

        <div className={styles['device-header-details']}>
          <div className={styles['device-header-text-element']}>
            <Text c="dimmed" size="sm">
              <span className={styles['detail-label']}>Model</span>
            </Text>
            <Text c="dimmed" size="sm">
              <span className={styles['detail-text']}>{device.model}</span>
            </Text>
          </div>
          <Divider orientation="vertical" />
          <div className={styles['device-header-text-element']}>
            <Text c="dimmed" size="sm">
              <span className={styles['detail-label']}>MAC address</span>
            </Text>
            <Text c="dimmed" size="sm">
              <span className={styles['detail-text']}>{device.mac}</span>
            </Text>
          </div>
          {room && (
            <>
              <Divider orientation="vertical" />
              <div className={styles['device-header-text-element']}>
                <Text c="dimmed" size="sm">
                  <span className={styles['detail-label']}>Location</span>
                </Text>
                <Text c="dimmed" size="sm">
                  <span className={styles['detail-text']}>
                    {home?.name} - {room.name}
                  </span>
                </Text>
              </div>
            </>
          )}
        </div>
      </Paper>

      <Sensor features={sensorFeatures} />
      <Online deviceId={device.id} features={onlineFeatures} />
      <ControllerFeature
        features={controllerFeatures}
        lastSent={device.modifiedAt}
        onChangeValue={handleControlChange}
        onSend={handleSendControls}
        isSending={isSending}
      />

      <Divider style={{ width: '100%', marginTop: '2rem' }} />

      <section className={styles['delete-section']}>
        <Button
          className={styles['delete-button'] ?? ''}
          leftSection={<IconTrash size={18} stroke={1.5} />}
          onClick={deleteHandlers.open}
          color="red"
          variant="light"
          loading={isSending}
          aria-label="Delete device"
        >
          Delete device
        </Button>
      </section>

      {/* Settings Modal */}
      <Modal
        opened={settingsOpened}
        onClose={settingsHandlers.close}
        title="Device Settings"
        centered
      >
        <div className="modal-form">
          <TextInput
            label="Device Name"
            placeholder="Enter device name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.currentTarget.value)}
            required
          />

          <Select
            label="Home"
            placeholder="Select a home"
            data={homeOptions}
            value={selectedHome}
            onChange={(value) => {
              setSelectedHome(value);
              setSelectedRoom(null);
            }}
            clearable
            required
          />

          {selectedHome && (
            <Select
              label="Room"
              placeholder="Select a room"
              data={roomOptions}
              value={selectedRoom}
              onChange={setSelectedRoom}
              clearable
              required
            />
          )}

          <div className="modal-actions">
            <Button variant="subtle" onClick={settingsHandlers.close}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              color="orange"
              disabled={!deviceName.trim() || !selectedHome || !selectedRoom}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteOpened}
        onClose={deleteHandlers.close}
        title="Confirm Deletion"
        centered
      >
        <Text size="sm" mb="xl">
          Are you sure you want to delete the device{' '}
          <strong>{device.name}</strong>? This action cannot be undone.
          <br />
          <br />
          <strong>Important:</strong> Make sure to power off the device first to
          prevent it from automatically re-registering as an unassigned device.
        </Text>
        <div className="modal-actions">
          <Button variant="subtle" onClick={deleteHandlers.close}>
            Cancel
          </Button>
          <Button onClick={handleDeleteDevice} color="red">
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default DeviceDetail;
