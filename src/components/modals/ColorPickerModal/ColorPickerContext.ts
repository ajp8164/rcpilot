import React, { createContext, createRef } from 'react';

import { ColorPickerModalMethods, Result } from './types';

export type ColorPickerContext = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraData: React.RefObject<any>;
  modal: React.RefObject<ColorPickerModalMethods | null>;
  recentColors: string[];
  onDismiss: (result: Result) => void;
  setRecentColors: (colors: string[]) => void;
};

export const ColorPickerContext = createContext<ColorPickerContext>({
  extraData: createRef(),
  modal: createRef(),
  recentColors: [],
  onDismiss: () => {
    return;
  },
  setRecentColors: () => {
    return;
  },
});
