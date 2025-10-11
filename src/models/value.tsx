import { Device, Feature } from './device';

export interface Value {
  featureUuid: string;
  type: string;
  name: string;
  value: number;
  createdAt: number;
  modifiedAt: number;
}

// *****************************************************************
// ********** requests, responses and utility interfaces ***********
// *****************************************************************
export interface DeviceWithValuesResponse extends Omit<Device, "features"> {
  features: FeatureValue[];
}

export interface FeatureValue extends Omit<Feature, "uuid"> {
  featureUuid: string;
  value: number;
  createdAt: number;
  modifiedAt: number;
}
export interface SetValueRequest {
  featureUuid: string;
  type: string;
  name: string;
  value: number;
}

export interface SetValueResponse {
  message: string
}