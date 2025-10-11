import { Card, CardActions, CardContent, Typography, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

import { Device } from '../../../models/device';

import styles from './device.module.scss';

export interface DeviceProps {
  device: Device;
  onShowSettings: (device: Device) => void;
  onShow: (device: Device) => void;
}

export default function DeviceCard(props: DeviceProps) {
  return (
    <Card variant="outlined">
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
        <IconButton aria-label="sensor" onClick={() => props.onShow(props.device)}>
          <AutoStoriesIcon/>
        </IconButton>
      </CardActions>
    </Card>
  )
}

