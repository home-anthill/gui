import { useState, forwardRef, ChangeEvent, useEffect, useMemo } from 'react';
import {
  Button,
  Snackbar,
  FormControl,
  FormControlLabel,
  Switch,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import MuiAlert, { AlertColor, AlertProps } from '@mui/material/Alert';

import { DeviceWithValuesResponse, FeatureValue } from '../../../models/value';
import { Device } from '../../../models/device';
import { useValues } from '../../../hooks/useValues';
import { getPrettyDateFromDateString } from '../../../utils/dateUtils';

import styles from './controllervalues.module.scss';

const SETPOINT_VALUES = [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
const HVAC_MODES = [
  { value: 1, label: 'Cool' },
  { value: 2, label: 'Auto' },
  { value: 3, label: 'Heat' },
  { value: 4, label: 'Fan' },
  { value: 5, label: 'Dry' },
];
const FAN_SPEEDS = [
  { value: 1, label: 'Min' },
  { value: 2, label: 'Med' },
  { value: 3, label: 'Max' },
  { value: 4, label: 'Auto' },
  { value: 5, label: 'Auto0' },
];
const TOLERANCE_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const STATE_SUCCESS = 'Device state update successfully!';
const STATE_ERROR = 'Cannot update device state!';

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface ValuesProps {
  deviceWithValues: DeviceWithValuesResponse;
}

export default function ControllerValues(props: ValuesProps) {
  const deviceRef = useMemo<Device>(() => ({
    ...props.deviceWithValues,
    features: (props.deviceWithValues.features ?? []).map(fv => ({
      uuid: fv.featureUuid,
      name: fv.name,
      type: fv.type,
      unit: fv.unit,
      order: fv.order,
      enable: fv.enable,
    })),
  }), [props.deviceWithValues]);

  const { trigger, lazyDeviceWithValues, setValues } = useValues(deviceRef);

  const [featureValues, setFeatureValues] = useState<FeatureValue[]>([]);

  const [snackBarState, setSnackBarState] = useState<{
    open: boolean;
    severity: AlertColor;
    message: string;
  }>({
    open: false,
    severity: 'success',
    message: STATE_SUCCESS,
  });

  useEffect(() => {
    async function fn() {
      if (!props.deviceWithValues) {
        return;
      }
      // update state calling setHome
      await trigger(deviceRef);
      if (!lazyDeviceWithValues) {
        return;
      }
      setFeatureValues(props.deviceWithValues.features);
    }
    fn();
  }, [props.deviceWithValues, deviceRef, lazyDeviceWithValues, trigger]);

  async function postValue() {
    try {
      const controllerFeatures = featureValues.filter(
        (f: FeatureValue) => f.type === 'controller'
      );
      await setValues(
        props.deviceWithValues.id,
        controllerFeatures
      ).unwrap();
      setSnackBarState({
        ...snackBarState,
        open: true,
        severity: 'success',
        message: STATE_SUCCESS,
      });
    } catch (err) {
      console.error('postValue - cannot update device state', err);
      setSnackBarState({
        ...snackBarState,
        open: true,
        severity: 'error',
        message: STATE_ERROR,
      });
    }
  }

  function handleBooleanChange(feature: FeatureValue, checked: boolean) {
    const fv = [...featureValues].map((f) => {
      if (f.featureUuid === feature.featureUuid) {
        return {
          ...f,
          value: checked ? 1 : 0,
        };
      } else return f;
    });
    setFeatureValues([...fv]);
  }

  function handleNumericChange(
    feature: FeatureValue,
    event: SelectChangeEvent
  ) {
    const fv = [...featureValues].map((f) => {
      if (f.featureUuid === feature.featureUuid) {
        return {
          ...f,
          value: +event.target.value,
        };
      } else return f;
    });
    setFeatureValues([...fv]);
  }

  const handleSnackbarClose = (_event: unknown, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackBarState(prev => ({ ...prev, open: false }));
  };

  const getValueFromFeature = (featureUuid: string): number => {
    const feature = featureValues.find((f) => f.featureUuid === featureUuid);
    return feature?.value || -999;
  };

  return (
    <div className={styles['controller-values']}>
      {featureValues
        ?.filter((feature: FeatureValue) => feature.type === 'controller')
        .map((feature: FeatureValue) => (
          <div className={styles['controller-value-container']} key={feature.featureUuid}>
            {(() => {
              switch (feature.name) {
                case 'on':
                  return (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={
                            getValueFromFeature(feature.featureUuid) === 1
                          }
                          onChange={(e: ChangeEvent, checked: boolean) =>
                            handleBooleanChange(feature, checked)
                          }
                        />
                      }
                      label="On/Off"
                    />
                  );
                case 'setpoint':
                  return (
                    <FormControl fullWidth>
                      <InputLabel id="setpoint-select-label">
                        Setpoint
                      </InputLabel>
                      <Select
                        labelId="setpoint-select-label"
                        id="setpoint-select"
                        value={String(getValueFromFeature(feature.featureUuid))}
                        label="Setpoint"
                        onChange={(e: SelectChangeEvent) =>
                          handleNumericChange(feature, e)
                        }
                      >
                        {SETPOINT_VALUES.map((item) => (
                          <MenuItem key={`setpoint-${item}`} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                case 'mode':
                  return (
                    <FormControl fullWidth>
                      <InputLabel id="mode-select-label">Mode</InputLabel>
                      <Select
                        labelId="mode-select-label"
                        id="mode-select"
                        value={String(getValueFromFeature(feature.featureUuid))}
                        label="Mode"
                        onChange={(e: SelectChangeEvent) =>
                          handleNumericChange(feature, e)
                        }
                      >
                        {HVAC_MODES.map((m) => (
                          <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                case 'fanSpeed':
                  return (
                    <FormControl fullWidth>
                      <InputLabel id="fan-select-label">Fan</InputLabel>
                      <Select
                        labelId="fan-select-label"
                        id="fan-select"
                        value={String(getValueFromFeature(feature.featureUuid))}
                        label="Fan"
                        onChange={(e: SelectChangeEvent) =>
                          handleNumericChange(feature, e)
                        }
                      >
                        {FAN_SPEEDS.map((f) => (
                          <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                case 'tolerance':
                  return (
                    <FormControl fullWidth>
                      <InputLabel id="tolerance-select-label">
                        Tolerance
                      </InputLabel>
                      <Select
                        labelId="tolerance-select-label"
                        id="tolerance-select"
                        value={String(getValueFromFeature(feature.featureUuid))}
                        label="Tolerance"
                        onChange={(e: SelectChangeEvent) =>
                          handleNumericChange(feature, e)
                        }
                      >
                        {TOLERANCE_VALUES.map((item) => (
                          <MenuItem key={`tolerance-${item}`} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                default:
                  return (
                    <Typography
                      sx={{ fontSize: 24 }}
                      color="text.secondary"
                      gutterBottom
                    >
                      Unsupported controller feature = {feature.name}
                    </Typography>
                  );
              }
            })()}
          </div>
        ))}

      {props.deviceWithValues?.modifiedAt && (
        <div className={styles['controller-date']}>
          <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
            {getPrettyDateFromDateString(
              props.deviceWithValues?.modifiedAt
            )}
          </Typography>
        </div>
      )}

      {featureValues?.filter(
        (feature: FeatureValue) => feature.type === 'controller'
      ).length > 0 && (
        <>
          <Button
            variant="contained"
            color="success"
            sx={{ marginTop: '10px' }}
            onClick={postValue}
          >
            Send
          </Button>

          <Snackbar
            open={snackBarState.open}
            autoHideDuration={2000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackBarState.severity}
              sx={{ width: '100%' }}
            >
              {snackBarState.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </div>
  );
}