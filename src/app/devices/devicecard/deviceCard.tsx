import { Card, CardActions, CardContent, Typography, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

import { Device } from '../../../models/device';

import styles from './device.module.scss';

export interface DeviceProps {
  device: Device;
  deviceType: string;
  onShowSettings: (device: Device) => void;
  onShowController: (device: Device) => void;
  onShowSensor: (device: Device) => void;
}


export default function DeviceCard(props: DeviceProps) {
  return (
    <Card variant="outlined"
          sx={{margin: '12px', minWidth: '250px'}}>
      <CardContent sx={{paddingTop: '14px', paddingLeft: '14px', paddingRight: '14px', paddingBottom: '6px'}}>
        <Typography sx={{fontSize: 14}} component="div">
          {props.device?.mac}
        </Typography>
        <Typography sx={{fontSize: 12}} color="text.secondary" gutterBottom>
          {props.device?.model} - {props.device?.manufacturer}
        </Typography>
        <div className={styles['device-divider']}></div>
      </CardContent>
      <CardActions>
        <IconButton aria-label="settings" onClick={() => props.onShowSettings(props.device)}>
          <SettingsIcon/>
        </IconButton>
        {props.deviceType === 'controller' &&
          <IconButton aria-label="controller" onClick={() => props.onShowController(props.device)}>
            <PlayArrowIcon/>
          </IconButton>
        }
        {props.deviceType === 'sensor' &&
          <IconButton aria-label="sensor" onClick={() => props.onShowSensor(props.device)}>
            <AutoStoriesIcon/>
          </IconButton>
        }
      </CardActions>
    </Card>
  )
}

