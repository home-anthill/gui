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
    <div className={styles['controller']}>
      <Typography variant="h2" component="h1">
        Controller
      </Typography>
      <div className={styles['controller-home-info']}>
        <Typography variant="body1" component="p">
          {home?.name} ({home?.location}) - {room?.name} ({room?.floor})
        </Typography>
      </div>
      <div className={styles['controller-container']}>
        <Typography variant="h5" component="h2">
          {device?.mac}
        </Typography>
        <Typography variant="subtitle1" component="h3">
          {device?.manufacturer} - {device?.model}
        </Typography>

        <Values device={device}/>
      </div>
    </div>
  );
}

export default Controller;
