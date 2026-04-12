import { createContext, useContext } from 'react';

export interface HomesActions {
  onEditHome: (homeId: string) => void;
  onDeleteHome: (homeId: string) => void;
  onAddRoom: (homeId: string) => void;
  onEditRoom: (homeId: string, roomId: string) => void;
  onDeleteRoom: (homeId: string, roomId: string) => void;
}

export const HomesActionsContext = createContext<HomesActions | null>(null);

export function useHomesActions(): HomesActions {
  const ctx = useContext(HomesActionsContext);
  if (!ctx) {
    throw new Error('useHomesActions must be used within HomesActionsContext.Provider');
  }
  return ctx;
}
