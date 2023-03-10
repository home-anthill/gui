import { useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';

import Values from './values/values';
import { Device, HomeWithDevices, RoomSplitDevices } from '../../models/device';

import styles from './controller.module.scss';

export function Controller() {
  const {state} = useLocation();
  const device: Device = state.device;
  const home: HomeWithDevices | undefined = state.home;
  const room: RoomSplitDevices | undefined = state.room;

  return (
    <div className={styles['Controller']}>
      <Typography variant="h2" component="h1">
        Controller
      </Typography>
      <div className={styles['ControllerContainer']}>
        <Typography variant="h5" component="h2">
          {device?.mac}
        </Typography>
        <Typography variant="subtitle1" component="h3">
          {device?.manufacturer} - {device?.model}
        </Typography>
        {home &&
          <Typography variant="subtitle1" component="h3">
            {home?.name} - {home?.location}
          </Typography>
        }
        {room &&
          <Typography variant="subtitle1" component="h3">
            {room?.name} ({room?.floor})
          </Typography>
        }

        <Values device={device}/>
      </div>
    </div>
  );
}

export default Controller;
