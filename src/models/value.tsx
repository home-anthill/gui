import { Device, Feature } from './device';

export interface Value {
  uuid: string;
  value: number;
  createdAt: number;
  modifiedAt: number;
}

// *****************************************************************
// ********** requests, responses and utility interfaces ***********
// *****************************************************************
export interface ValuesProps {
  device: Device;
}

export interface SensorValueProps {
  id: string;
  feature: FeatureValue;
}

export interface FeatureValue extends Feature {
  value: number;
  createdAt: number;
  modifiedAt: number;
}

export interface SensorWithValue extends Device {
  features: FeatureValue[];
}
