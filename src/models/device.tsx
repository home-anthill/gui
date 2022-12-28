export interface Device {
  id: string;
  uuid: string;
  mac: string;
  manufacturer: string;
  model: string;
  createdAt: Date;
  modifiedAt: Date;
  features: Feature[];
}

export interface Feature {
  uuid: string;
  name: string;
  type: string;
  unit: string;
  order: number;
  enable: boolean;
}
