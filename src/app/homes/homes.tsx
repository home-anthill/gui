import { useCallback, useMemo, useState } from 'react';
import {
  Title,
  Text,
  Button,
  Paper,
  Modal,
  TextInput,
  NumberInput,
  Accordion,
  Loader,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconBuilding, IconAlertCircle } from '@tabler/icons-react';
import { logError } from '../../utils/logger';

import { useHomes } from '../../hooks/useHomes';
import { HomeAccordion } from './home/home';
import { HomesActionsContext } from './HomesActionsContext';
import { useRooms } from '../../hooks/useRooms';

import styles from './homes.module.scss';

export function Homes() {
  const { homes, homesLoading, homesError, addHome, updateHome, deleteHome } =
    useHomes();
  const { deleteRoom, addRoom, updateRoom } = useRooms();

  const [homeModalOpened, { open: openHomeModal, close: closeHomeModal }] =
    useDisclosure(false);
  const [roomModalOpened, { open: openRoomModal, close: closeRoomModal }] =
    useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  const [editingHome, setEditingHome] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<{
    homeId: string;
    roomId: string | null;
  }>({ homeId: '', roomId: null });
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'home' | 'room';
    homeId: string;
    roomId?: string;
  } | null>(null);

  const [homeName, setHomeName] = useState('');
  const [homeLocation, setHomeLocation] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomFloor, setRoomFloor] = useState<number | ''>(0);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleOpenHomeModal = useCallback((homeId?: string) => {
    if (homeId) {
      const home = homes.find((h) => h.id === homeId);
      if (home) {
        setHomeName(home.name);
        setHomeLocation(home.location);
        setEditingHome(homeId);
      }
    } else {
      setHomeName('');
      setHomeLocation('');
      setEditingHome(null);
    }
    openHomeModal();
  }, [homes, openHomeModal]);

  const handleSaveHome = async () => {
    try {
      if (editingHome) {
        await updateHome(editingHome, homeName, homeLocation);
      } else {
        await addHome(homeName, homeLocation);
      }
      closeHomeModal();
    } catch (err) {
      logError('Cannot save home', err);
    }
  };

  const handleOpenRoomModal = useCallback((homeId: string, roomId?: string) => {
    if (roomId) {
      const room = homes
        .find((h) => h.id === homeId)
        ?.rooms.find((r) => r.id === roomId);
      if (room) {
        setRoomName(room.name);
        setRoomFloor(room.floor);
        setEditingRoom({ homeId, roomId });
      }
    } else {
      setRoomName('');
      setRoomFloor(0);
      setEditingRoom({ homeId, roomId: null });
    }
    openRoomModal();
  }, [homes, openRoomModal]);

  const handleSaveRoom = async () => {
    if (roomFloor === '') return;
    try {
      if (editingRoom.roomId) {
        await updateRoom(editingRoom.homeId, editingRoom.roomId, {
          name: roomName,
          floor: roomFloor,
        });
      } else {
        await addRoom(editingRoom.homeId, { name: roomName, floor: roomFloor });
      }
      closeRoomModal();
    } catch (err) {
      logError('Cannot save room', err);
    }
  };

  const handleOpenDeleteModal = useCallback((
    type: 'home' | 'room',
    homeId: string,
    roomId?: string,
  ) => {
    setDeleteTarget({ type, homeId, ...(roomId !== undefined ? { roomId } : {}) });
    openDeleteModal();
  }, [openDeleteModal]);

  const handleDeleteHome = useCallback(
    (homeId: string) => handleOpenDeleteModal('home', homeId),
    [handleOpenDeleteModal],
  );

  const handleDeleteRoom = useCallback(
    (homeId: string, roomId: string) =>
      handleOpenDeleteModal('room', homeId, roomId),
    [handleOpenDeleteModal],
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'home') {
        await deleteHome(deleteTarget.homeId);
      } else if (deleteTarget.roomId) {
        await deleteRoom(deleteTarget.homeId, deleteTarget.roomId);
      }
      closeDeleteModal();
      setDeleteTarget(null);
    } catch (err) {
      logError('Cannot delete item', err);
    }
  };

  const actionsValue = useMemo(
    () => ({
      onEditHome: handleOpenHomeModal,
      onDeleteHome: handleDeleteHome,
      onAddRoom: handleOpenRoomModal,
      onEditRoom: handleOpenRoomModal,
      onDeleteRoom: handleDeleteRoom,
    }),
    [handleOpenHomeModal, handleDeleteHome, handleOpenRoomModal, handleDeleteRoom],
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  if (homesLoading) {
    return (
      <div className="page-loading">
        <Loader color="orange" size="lg" />
      </div>
    );
  }

  if (homesError) {
    return (
      <div className="page-error">
        <Alert
          icon={<IconAlertCircle size={18} />}
          color="red"
          title="Failed to load homes"
        >
          Could not load your homes. Please try again later.
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles['homes-page']}>
      <div className={styles['homes-page-header']}>
        <div>
          <Title order={1} c="white">
            Homes
          </Title>
          <Text c="dimmed" size="sm" mt="xs">
            Manage your homes and rooms
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => handleOpenHomeModal()}
          color="orange"
        >
          Add Home
        </Button>
      </div>

      {homes.length === 0 ? (
        <Paper p="xl" radius="md" withBorder className={styles['empty-state'] ?? ''}>
          <div className={styles['empty-state-inner']}>
            <IconBuilding size={48} stroke={1.5} color="#5c5f66" />
            <Text c="dimmed" size="lg" ta="center">
              No homes configured
            </Text>
            <Button
              onClick={() => handleOpenHomeModal()}
              color="orange"
              variant="light"
            >
              Add your first home
            </Button>
          </div>
        </Paper>
      ) : (
        <HomesActionsContext.Provider value={actionsValue}>
          <Accordion
            variant="separated"
            radius="md"
            className={styles['homes-accordion'] ?? ''}
          >
            {homes.map((home) => (
              <HomeAccordion key={home.id} home={home} />
            ))}
          </Accordion>
        </HomesActionsContext.Provider>
      )}

      {/* Modal: add/edit home */}
      <Modal
        opened={homeModalOpened}
        onClose={closeHomeModal}
        title={editingHome ? 'Edit Home' : 'Add Home'}
        centered
      >
        <div className="modal-form">
          <TextInput
            label="Name"
            placeholder="Main Home"
            value={homeName}
            onChange={(e) => setHomeName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Location"
            placeholder="123 Main St, New York"
            value={homeLocation}
            onChange={(e) => setHomeLocation(e.currentTarget.value)}
            required
          />
          <div className="modal-actions">
            <Button
              variant="subtle"
              onClick={closeHomeModal}
              // disabled={isSavingHome}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveHome}
              color="orange"
              disabled={!homeName || !homeLocation}
              // loading={isSavingHome}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: add/edit room */}
      <Modal
        opened={roomModalOpened}
        onClose={closeRoomModal}
        title={editingRoom.roomId ? 'Edit Room' : 'Add Room'}
        centered
      >
        <div className="modal-form">
          <TextInput
            label="Name"
            placeholder="Living Room"
            value={roomName}
            onChange={(e) => setRoomName(e.currentTarget.value)}
            required
          />
          <NumberInput
            label="Floor"
            placeholder="0"
            value={roomFloor}
            onChange={(value) => setRoomFloor(value as number | '')}
            min={-5}
            max={100}
            required
          />
          <div className="modal-actions">
            <Button
              variant="subtle"
              onClick={closeRoomModal}
              // disabled={isSavingRoom}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRoom}
              color="orange"
              disabled={!roomName || roomFloor === ''}
              // loading={isSavingRoom}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: delete confirmation */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Confirm Deletion"
        centered
      >
        <div className="modal-form">
          <Text>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </Text>
          <div className="modal-actions">
            <Button variant="subtle" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="red">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Homes;
