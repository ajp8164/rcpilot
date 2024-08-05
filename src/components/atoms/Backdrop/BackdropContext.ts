import { createContext } from 'react';

export type BackdropContext = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

export const BackdropContext = createContext<BackdropContext>({
  enabled: false,
  setEnabled: () => {
    return;
  },
});
