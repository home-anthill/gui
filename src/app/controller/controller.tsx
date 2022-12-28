import { useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';

import Values from './values/values';

import styles from './controller.module.scss';

export function Controller() {
  const {state} = useLocation();
  const device = state.device;

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

        <Values device={device}/>
      </div>
    </div>
  );
}

export default Controller;
