import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Typography, Fab, Dialog, DialogTitle, Button, DialogContent, TextField, DialogActions, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import styles from './homes.module.scss';

import { useHomes } from '../../hooks/useHomes';
import { Home } from '../../models/home';
import HomeCard from './homecard/homeCard';

export interface NewHomeProps {
  onClose: (value: boolean) => void;
  open: boolean;
}

export function Homes() {
  const [open, setOpen] = useState(false);
  const {homes, loading, homesError, deleteHome} = useHomes();
  const navigate = useNavigate();

  const editHome = useCallback((home: Home): void => {
    navigate(`/main/homes/${home.id}/edit`);
  }, [navigate]);

  const removeHome = useCallback(async (home: Home): Promise<void> => {
    try {
      await deleteHome(home.id).unwrap();
    } catch (err) {
      console.error(`removeHome - cannot delete home with id = ${home.id}`, err);
    }
  }, [deleteHome]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <div className={styles['homes']}>
      <NewHomeDialog
        open={open}
        onClose={handleClose}/>
      <Typography variant="h2" component="h1" textAlign={'center'}>
        Homes
      </Typography>
      <div className={styles['homes-container']}>
        {homesError ? (
          <div className="error">Something went wrong</div>
        ) : loading ? (
          <div className={styles['loading']}>Loading...</div>
        ) : homes.length > 0 ? (
          <>
            {homes.map((home: Home) => (
              <HomeCard key={home.id}
                        home={home}
                        onEdit={editHome}
                        onDelete={() => removeHome(home)}>
              </HomeCard>
            ))}
          </>
        ) : (
          'No data to show'
        )}
      </div>
      <Fab color="primary"
           sx={{
             position: 'absolute',
             bottom: 32,
             right: 32
           }}
           aria-label="add"
           onClick={handleOpen}>
        <AddIcon/>
      </Fab>
    </div>
  );
}

function NewHomeDialog(props: NewHomeProps) {
  const defaultValues = {
    nameInput: '',
    locationInput: ''
  };
  const {handleSubmit, reset, control} = useForm<{ nameInput: string; locationInput: string }>({defaultValues});
  const {addHome} = useHomes();

  const handleClose = () => {
    reset();
    props.onClose(false);
  };

  const handleAdd = (value: boolean) => {
    reset();
    props.onClose(value);
  };

  const onAddHome = handleSubmit(async (values) => {
    try {
      await addHome(values.nameInput, values.locationInput).unwrap();
      handleAdd(true);
    } catch (err) {
      console.error('onAddHome - cannot add a new home, err = ', err);
      handleAdd(false);
    }
  });

  return (
    <Dialog open={props.open} onClose={handleClose}>
      <DialogTitle>Create a new home</DialogTitle>
      <DialogContent>
        <form onSubmit={onAddHome} className={styles['form']}>
          <FormControl>
            <Controller
              render={({field, fieldState}) =>
                <TextField
                  id="name-input"
                  variant="outlined"
                  label="Name"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message ?? ''}
                  {...field} />
              }
              name="nameInput"
              rules={{required: 'Required', maxLength: {value: 15, message: 'Max 15 chars'}, pattern: {value: /^[a-zA-Z0-9\s\-_]+$/, message: 'Alphanumeric only'}}}
              control={control}
            />
          </FormControl>
          <FormControl>
            <Controller
              render={({field, fieldState}) =>
                <TextField
                  sx={{
                    marginLeft: '15px'
                  }}
                  id="location-input"
                  variant="outlined"
                  label="Location"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message ?? ''}
                  {...field} />
              }
              name="locationInput"
              rules={{required: 'Required', maxLength: {value: 15, message: 'Max 15 chars'}, pattern: {value: /^[a-zA-Z0-9\s\-_]+$/, message: 'Alphanumeric only'}}}
              control={control}
            />
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()}>Cancel</Button>
        <Button onClick={onAddHome}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}

export default Homes;
