import { FormEvent, MouseEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Typography, Button, TextField, FormControl, Stack, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';

import styles from './edithome.module.scss';

import { Home, Room } from '../../models/home';
import { useHomes } from '../../hooks/useHomes';
import { useRooms } from '../../hooks/useRooms';

export function EditHome() {
  const id = useParams().id as string;
  const {homes, updateHome} = useHomes();
  const {deleteRoom, addRoom, updateRoom} = useRooms();

  const home: Home | undefined = homes.find((home: Home) => home && home.id === id);

  const {handleSubmit, control, getValues} = useForm({
    defaultValues: {
      nameInput: !home ? '' : (home as Home).name,
      locationInput: !home ? '' : (home as Home).location
    }
  });

  const roomsForm = useForm({
    defaultValues: {
      rooms: !home ? [] : (home as Home).rooms,
    }
  });
  const {fields, append, remove} = useFieldArray({
    control: roomsForm.control,
    name: 'rooms'
  });

  const navigate = useNavigate();

  const onAddHome = async () => {
    const values = getValues();
    try {
      const result = await updateHome(id, values.nameInput, values.locationInput).unwrap();
      console.log('onAddHome - result = ', result);
      // navigate back
      navigate(-1);
    } catch (err) {
      console.error('onAddHome - cannot add a new home');
    }
  }

  async function onRemoveRoom(index: number) {
    const room: Room = roomsForm.getValues().rooms[index];
    // remove room from array
    remove(index);
    // in case you are creating a room, and you decide to remove it before adding it to the server
    if (!room.id) {
      return;
    }
    try {
      const result = await deleteRoom(id, room.id).unwrap();
      console.log('onRemoveRoom - result = ', result);
      // navigate back
      navigate(-1);
    } catch (err) {
      console.error('onRemoveRoom -cannot add a new home');
    }
  }

  async function onSaveRoom(e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const rooms: Room[] = roomsForm.getValues().rooms;
    try {
      for (const room of rooms) {
        if (room.id) {
          console.log('onSaveRoom - updating existing room = ', room);
          const result = await updateRoom(
            (home as Home).id,
            room.id,
            {
              name: room.name,
              floor: +room.floor
            } as Room
          ).unwrap();
          console.log('onSaveRoom - update result = ', result);
        } else {
          console.log('onSaveRoom - adding new room = ', room);
          const result = await addRoom(
            (home as Home).id,
            {
              name: room.name,
              floor: +room.floor
            } as Room
          ).unwrap();
          console.log('onSaveRoom - add result = ', result);
        }
      }
      // navigate back
      navigate(-1);
    } catch (err) {
      console.error('onSaveRoom - cannot add a new home');
    }
  }

  return (
    <div className={styles['edit-home']}>
      <Typography variant="h2" component="h1">
        Edit Home
      </Typography>
      <div className={styles['edit-home-container']}>
        <form onSubmit={handleSubmit((data) => onAddHome())} className="form">
          <FormControl>
            <Controller
              render={({field}) =>
                <TextField
                  id="name-input"
                  variant="outlined"
                  label="Name"
                  {...field} />
              }
              name="nameInput"
              rules={{required: true, maxLength: 15}}
              control={control}
            />
          </FormControl>
          <FormControl>
            <Controller
              render={({field}) =>
                <TextField
                  sx={{
                    left: 15
                  }}
                  id="location-input"
                  variant="outlined"
                  label="Location"
                  {...field} />
              }
              name="locationInput"
              rules={{required: true, maxLength: 15}}
              control={control}
            />
          </FormControl>
        </form>
      </div>
      <Button variant="outlined" onClick={() => onAddHome()}>Save Home</Button>

      <div className={styles['edit-home-divider']}></div>

      <Typography variant="h2" component="h1">
        Rooms
      </Typography>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        sx={{
          marginTop: '30px'
        }}
      >
        {fields.map((item, index) => (
          <form className={styles['room']} key={`room-${index}`}>
            <FormControl>
              <Controller
                render={({field}) =>
                  <TextField
                    variant="standard"
                    label="Name"
                    {...field} />
                }
                name={`rooms.${index}.name`}
                rules={{required: true, maxLength: 15}}
                control={roomsForm.control}
              />
            </FormControl>
            <FormControl>
              <Controller
                render={({field}) =>
                  <TextField
                    sx={{
                      left: 15
                    }}
                    variant="standard"
                    label="Floor"
                    inputProps={{inputMode: 'numeric', pattern: '[0-9]*'}}
                    {...field} />
                }
                name={`rooms.${index}.floor`}
                rules={{required: true}}
                control={roomsForm.control}
              />
            </FormControl>
            <IconButton
              aria-label="save"
              onClick={onSaveRoom}>
              <CheckIcon/>
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() => onRemoveRoom(index)}>
              <DeleteIcon/>
            </IconButton>
          </form>
        ))}
      </Stack>
      <br/>
      <br/>
      <Button onClick={() => {
        append({name: '', floor: 0} as Room);
      }}>(+ add room)</Button>

      <br/><br/>
    </div>
  );
}

export default EditHome;
