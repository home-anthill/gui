export interface ACValueStates {
  on: boolean;
  temperature: number;
  mode: number;
  fanSpeed: number;
}

export interface ACValue extends ACValueStates {
  createdAt: number;
  modifiedAt: number;
}
