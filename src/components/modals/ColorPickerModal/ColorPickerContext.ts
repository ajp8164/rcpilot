import React from 'react';
import { ColorPickerModalMethods, Result } from './types';
import { createContext, createRef } from 'react';

export type ColorPickerContext = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraData: React.RefObject<any>;
  modal: React.RefObject<ColorPickerModalMethods | null>;
  recentColors: string[];
  onDismiss: (result: Result) => void;
  onEyedropper: (active: boolean) => void;
  setRecentColors: (colors: string[]) => void;
};

export const ColorPickerContext = createContext<ColorPickerContext>({
  extraData: createRef(),
  modal: createRef(),
  recentColors: [],
  onDismiss: () => {
    return;
  },
  onEyedropper: () => {
    return;
  },
  setRecentColors: () => {
    return;
  },
});
