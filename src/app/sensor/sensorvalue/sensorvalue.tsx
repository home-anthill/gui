import { Card, CardContent, Typography } from '@mui/material';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import LightModeIcon from '@mui/icons-material/LightMode';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import WbCloudyIcon from '@mui/icons-material/WbCloudy';
import CompressIcon from '@mui/icons-material/Compress';

import { Feature } from '../../../models/device';

import styles from './sensorvalue.module.scss';

export interface SensorValueProps {
  feature: FeatureValue;
}

export interface FeatureValue extends Feature {
  value: number;
}

export default function SensorValue(props: SensorValueProps) {
  return (
    <Card variant="outlined"
          key={props.feature?.uuid}
          sx={{margin: '12px', minWidth: '250px'}}>
      <CardContent sx={{paddingTop: '14px', paddingLeft: '14px', paddingRight: '14px', paddingBottom: '6px'}}>
        <div className={styles['sensor-value-container']}>
          <div className={styles['sensor-header']}>
            {(() => {
              switch(props.feature.name) {
                case 'temperature':
                  return <DeviceThermostatIcon fontSize="large"></DeviceThermostatIcon>
                case 'humidity':
                  return <InvertColorsIcon fontSize="large"></InvertColorsIcon>
                case 'light':
                  return <LightModeIcon fontSize="large"></LightModeIcon>
                case 'motion':
                  return <DirectionsRunIcon fontSize="large"></DirectionsRunIcon>
                case 'airquality':
                  return <WbCloudyIcon fontSize="large"></WbCloudyIcon>
                case 'airpressure':
                  return <CompressIcon fontSize="large"></CompressIcon>
                default:
                  return (
                    <>
                      Unsupported feature = {props.feature.name}
                    </>
                  )
              }
            })()}
            <Typography sx={{fontSize: 14}} component="div">
              {props.feature?.name.toUpperCase()}
            </Typography>
          </div>
          <div className={styles['sensor-value']}>
            {(() => {
              switch(props.feature.name) {
                case 'temperature':
                case 'humidity':
                  return (
                    <Typography sx={{fontSize: 24}} color="text.secondary" gutterBottom>
                      {props.feature?.value.toFixed(2)} {props.feature?.unit}
                    </Typography>
                  )
                case 'light':
                  return (
                    <Typography sx={{fontSize: 24}} color="text.secondary" gutterBottom>
                      {props.feature?.value.toFixed(0)} {props.feature?.unit}
                    </Typography>
                  )
                case 'motion':
                  return (
                    <Typography sx={{fontSize: 24}} color="text.secondary" gutterBottom>
                      {props.feature?.value === 1 ? 'True' : 'False' }
                    </Typography>
                  )
                case 'airquality':
                  return (
                    <Typography sx={{fontSize: 24}} color="text.secondary" gutterBottom>
                      {(() => {
                        switch(props.feature?.value) {
                          case 0:
                            return 'Extreme pollution'
                          case 1:
                            return 'High pollution'
                          case 2:
                            return 'Mid pollution'
                          case 3:
                            return 'Low pollution'
                          default:
                            return 'Unknown'
                        }
                      })()}
                    </Typography>
                  )
                case 'airpressure':
                  return (
                    <Typography sx={{fontSize: 24}} color="text.secondary" gutterBottom>
                      {props.feature?.value.toFixed(0)} {props.feature?.unit}
                    </Typography>
                  )
                default:
                  return (
                    <Typography sx={{fontSize: 24}} color="text.secondary" gutterBottom>
                      Unsupported feature = {props.feature.name}
                    </Typography>
                  )
              }
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
