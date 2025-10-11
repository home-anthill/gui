import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';

import { Home, Room } from '../../models/home';
import { Device } from '../../models/device';
import { useDevices } from '../../hooks/useDevices';
import { useHomes } from '../../hooks/useHomes';

import styles from './devicesettings.module.scss';

const DEFAULT_HOME: Home = {id: 'h0', name: '---', location: '', rooms: [], createdAt: new Date(), modifiedAt: new Date()};
const DEFAULT_ROOM: Room = {id: 'r0', name: '---', floor: -1, devices: [], createdAt: new Date(), modifiedAt: new Date()};

export function DeviceSettings() {
  const {state} = useLocation();
  const device: Device = state.device;
  const navigate = useNavigate();

  const { trigger, lazyHomes } = useHomes();
  const { assignDeviceHomeRoom, deleteDevice } = useDevices();

  const [homes, setHomes] = useState<Home[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [selectedHome, setSelectedHome] = useState<Home | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    async function fn() {
      try {
        await trigger();
        const homes: Home[] = [DEFAULT_HOME, ...lazyHomes];
        setHomes(homes);

        let homeFound: Home = DEFAULT_HOME;
        let roomFound: Room = DEFAULT_ROOM;
        homes.forEach((home: Home) => {
          home.rooms.forEach((room: Room) => {
            if (room && room.devices && room.devices.find((deviceId: string) => deviceId === device.id)) {
              homeFound = home;
              roomFound = room;
            }
          });
        });

        if (homeFound) {
          setRooms([DEFAULT_ROOM, ...homeFound.rooms])
          setSelectedHome(homeFound);
          setSelectedRoom(roomFound);
        }
      } catch (err) {
        console.error('cannot get homes', err);
      }
    }
    fn();
  }, [device.id, lazyHomes, trigger]);

  function onChangeHome(event: SelectChangeEvent) {
    if (!event || !event.target || !event.target.value) {
      return;
    }
    const selectedHomeId: string = event.target.value;
    const home: Home | undefined = homes.find((home: Home) => home.id === selectedHomeId);
    if (!home) {
      console.error('onChangeHome - cannot find home');
      return;
    }
    setRooms([DEFAULT_ROOM, ...home.rooms])
    setSelectedHome(home);
    setSelectedRoom(DEFAULT_ROOM)
  }

  function onChangeRoom(event: SelectChangeEvent) {
    if (!event || !event.target || !event.target.value) {
      return;
    }
    const selectedRoomId: string = event.target.value;
    const room: Room | undefined = rooms.find((room: Room) => room.id === selectedRoomId)
    if (!room) {
      console.error('onChangeRoom - cannot find room');
      return;
    }
    setSelectedRoom(room);
  }

  async function onAssign() {
    if (!selectedHome || !selectedRoom) {
      console.error('onAssign - cannot assign device, you must choose both home and room');
      return;
    }
    try {
      const response = await assignDeviceHomeRoom(device.id, selectedHome.id, selectedRoom.id);
      // navigate back
      navigate(-1);
    } catch (err) {
      console.error('onAssign - cannot assign device to home and room');
    }
  }

  async function onRemove() {
    try {
      const response = await deleteDevice(device.id).unwrap();
      // navigate back
      navigate(-1);
    } catch (err) {
      console.error('onRemove -  cannot remove device');
    }
  }

  return (
    <div className={styles['DeviceSettings']}>
      <Typography variant="h2" component="h1">
        Settings
      </Typography>
      <div className={styles['DeviceSettingsContainer']}>
        <Typography variant="h5" component="h2">
          {device?.mac}
        </Typography>
        <Typography variant="subtitle1" component="h3">
          {device?.manufacturer} - {device?.model}
        </Typography>
        <br/>

        {selectedHome &&
          <FormControl fullWidth>
            <InputLabel id="homes-select-label">Home</InputLabel>
            <Select
              labelId="homes-select-label"
              id="homes-select"
              value={selectedHome.id}
              label="home"
              onChange={onChangeHome}
            >
              {homes.map((home: Home) => <MenuItem key={home.id} value={home.id}>{home.name}</MenuItem>)}
            </Select>
          </FormControl>
        }

        <br/>

        {selectedRoom &&
          <FormControl fullWidth>
            <InputLabel id="rooms-select-label">Room</InputLabel>
            <Select
              labelId="rooms-select-label"
              id="rooms-select"
              value={selectedRoom.id}
              label="room"
              onChange={onChangeRoom}
            >
              {
                rooms.map((room: Room) => <MenuItem key={room.id} value={room.id}>{room.name}</MenuItem>)
              }
            </Select>
          </FormControl>
        }

        <br/>
        {selectedHome !== DEFAULT_HOME && selectedRoom !== DEFAULT_ROOM &&
          <Button onClick={() => onAssign()}>Assign</Button>
        }
        <br/>
        <Button onClick={() => onRemove()}>Remove this Device</Button>
        <br/>
      </div>
    </div>
  );
}

export default DeviceSettings;
