import { useState, forwardRef, ChangeEvent, useEffect } from 'react';

import { Button, Snackbar, FormControl, FormControlLabel, Switch, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

import { Device } from '../../../models/device';
import { useACValue } from '../../../hooks/useACValue';

import styles from './values.module.scss';

export interface ValuesProps {
  device: Device;
}

const STATE_SUCCESS = 'Device state update successfully!';
const STATE_ERROR = 'Cannot update device state!';

export function Values(props: ValuesProps) {
  const { trigger, acValue, updateACValue } = useACValue();

  const [onOff, setOnOff] = useState(false);
  const [temperature, setTemperature] = useState(28);
  const [mode, setMode] = useState(1);
  const [fanSpeed, setFanSpeed] = useState(1);
  const [snackBarState, setSnackBarState] = useState({
    open: false,
    severity: 'success',
    message: STATE_SUCCESS
  });

  useEffect(() => {
    async function fn() {
      // update form calling set*** one by one
      await trigger(props.device.id);
      setOnOff(acValue.on);
      setTemperature(acValue.temperature);
      setMode(acValue.mode);
      setFanSpeed(acValue.fanSpeed);
    }
    fn();
  }, []);

  // use a custom Alert extending MuiAlert instead of the Alert defined in @mui/material
  const Alert = forwardRef(function Alert(props: any, ref: any) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  async function postValue() {
    try {
      const response = await updateACValue(props.device.id, {
          on: onOff,
          temperature: temperature,
          mode: mode,
          fanSpeed: fanSpeed
        }).unwrap();
      console.log('postValue - response = ', response);
      setSnackBarState({...snackBarState, open: true, severity: 'success', message: STATE_SUCCESS});
    } catch (err) {
      console.log('postValue - cannot set device values. Err = ', err);
      setSnackBarState({...snackBarState, open: true, severity: 'error', message: STATE_ERROR});
    }
  }

  function handleOnOffChange(checked: boolean) {
    setOnOff(checked);
  }

  function handleTemperatureChange(event: SelectChangeEvent) {
    setTemperature(+(event.target.value));
  }

  function handleModeChange(event: SelectChangeEvent) {
    setMode(+(event.target.value));
  }

  function handleFanSpeedChange(event: SelectChangeEvent) {
    setFanSpeed(+(event.target.value));
  }

  const handleSnackbarClose = (event: any, reason: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackBarState({...snackBarState, open: false});
  };

  return (
    <div className={styles['values']}>
      <div className={styles['value-container']}>
        <FormControlLabel
          control={
            <Switch
              checked={onOff}
              onChange={(e: ChangeEvent, checked: boolean) => handleOnOffChange(checked)}/>
          }
          label="On/Off"
        />
      </div>
      <div className={styles['value-container']}>
        <FormControl fullWidth>
          <InputLabel id="temperature-select-label">Temperature</InputLabel>
          <Select
            labelId="temperature-select-label"
            id="temperature-select"
            value={String(temperature)}
            label="Temperature"
            onChange={(e: SelectChangeEvent) => handleTemperatureChange(e)}
          >
            {[17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(item => (
              <MenuItem key={`temp-${item}`} value={item}>{item}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className={styles['value-container']}>
        <FormControl fullWidth>
          <InputLabel id="mode-select-label">Mode</InputLabel>
          <Select
            labelId="mode-select-label"
            id="mode-select"
            value={String(mode)}
            label="Mode"
            onChange={(e: SelectChangeEvent) => handleModeChange(e)}
          >
            <MenuItem value={1}>Cool</MenuItem>
            <MenuItem value={2}>Auto</MenuItem>
            <MenuItem value={3}>Heat</MenuItem>
            <MenuItem value={4}>Fan</MenuItem>
            <MenuItem value={5}>Dry</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className={styles['value-container']}>
        <FormControl fullWidth>
          <InputLabel id="fan-select-label">Fan</InputLabel>
          <Select
            labelId="fan-select-label"
            id="fan-select"
            value={String(fanSpeed)}
            label="Fan"
            onChange={(e: SelectChangeEvent) => handleFanSpeedChange(e)}
          >
            <MenuItem value={1}>Min</MenuItem>
            <MenuItem value={2}>Med</MenuItem>
            <MenuItem value={3}>Max</MenuItem>
            <MenuItem value={4}>Auto</MenuItem>
            <MenuItem value={5}>Auto0</MenuItem>
          </Select>
        </FormControl>
      </div>

      <Button variant="contained"
              color="success"
              sx={{marginTop: '10px'}}
              onClick={postValue}>Send</Button>

      <Snackbar open={snackBarState.open}
                autoHideDuration={2000}
                onClose={handleSnackbarClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
        <Alert onClose={handleSnackbarClose} severity={snackBarState.severity} sx={{width: '100%'}}>
          {snackBarState.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Values;
