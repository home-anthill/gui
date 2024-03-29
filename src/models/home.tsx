export interface Home {
  id: string;
  name: string;
  location: string;
  createdAt: Date;
  modifiedAt: Date;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  floor: number;
  createdAt: Date;
  modifiedAt: Date;
  devices: string[]
}

// *****************************************************************
// ********** requests, responses and utility interfaces ***********
// *****************************************************************
export interface NewHomeRequest {
  name: string;
  location: string;
  rooms: [];
}

export interface UpdateHomeRequest {
  id: string;
  name: string;
  location: string;
}
