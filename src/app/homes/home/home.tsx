import { Text, Button, Paper, ActionIcon, Accordion } from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconBuilding,
} from '@tabler/icons-react';
import { Home, Room } from '../../../models/home';
import { useHomesActions } from '../HomesActionsContext';

import styles from './home.module.scss';

interface HomeProps {
  home: Home;
}

export function HomeAccordion({ home }: HomeProps) {
  const { onEditHome, onDeleteHome, onAddRoom, onEditRoom, onDeleteRoom } =
    useHomesActions();
  return (
    <Accordion.Item value={home.id} className={styles['home-item'] ?? ''}>
      <div className={styles['home-control-wrapper']}>
        <Accordion.Control style={{ flex: 1 }}>
          <div className={styles['home-control-info']}>
            <IconBuilding size={24} stroke={1.5} color="#ff922b" />
            <div>
              <Text fw={600} size="lg">
                {home.name}
              </Text>
              <Text size="sm" c="dimmed">
                {home.location}
              </Text>
            </div>
          </div>
        </Accordion.Control>
        <div className={styles['home-control-actions']}>
          <ActionIcon
            variant="light"
            color="gray"
            size="lg"
            onClick={() => onEditHome(home.id)}
            aria-label="Edit home"
          >
            <IconEdit size={20} stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            size="lg"
            onClick={() => onDeleteHome(home.id)}
            aria-label="Delete home"
          >
            <IconTrash size={20} stroke={1.5} />
          </ActionIcon>
        </div>
      </div>

      <Accordion.Panel>
        <div className={styles['home-panel']}>
          <Button
            leftSection={<IconPlus size={16} />}
            size="sm"
            variant="light"
            color="orange"
            onClick={() => onAddRoom(home.id)}
            style={{ alignSelf: 'flex-start' }}
          >
            Add Room
          </Button>

          {home.rooms.length === 0 ? (
            <Text c="dimmed" size="sm" ta="center" py="md">
              No rooms configured
            </Text>
          ) : (
            <div className={styles['rooms-list']}>
              {home.rooms.map((room: Room) => (
                <Paper
                  key={room.id}
                  p="md"
                  radius="md"
                  withBorder
                  className={styles['room-item'] ?? ''}
                >
                  <div className={styles['room-item-inner']}>
                    <div className={styles['room-item-info']}>
                      <Text fw={600} size="md" c="white">
                        {room.name}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Floor {room.floor}
                      </Text>
                    </div>
                    <div className={styles['room-item-actions']}>
                      <ActionIcon
                        variant="light"
                        color="gray"
                        size="lg"
                        onClick={() => onEditRoom(home.id, room.id)}
                        aria-label="Edit room"
                      >
                        <IconEdit size={20} stroke={1.5} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        size="lg"
                        onClick={() => onDeleteRoom(home.id, room.id)}
                        aria-label="Delete room"
                      >
                        <IconTrash size={20} stroke={1.5} />
                      </ActionIcon>
                    </div>
                  </div>
                </Paper>
              ))}
            </div>
          )}
        </div>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
