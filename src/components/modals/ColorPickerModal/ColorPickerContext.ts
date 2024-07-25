import React from 'react';
import { ColorPickerModalMethods, Result } from './types';
import { createContext, createRef } from 'react';

export type ColorPickerContext = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraData: React.MutableRefObject<any>;
  modal: React.RefObject<ColorPickerModalMethods>;
  onDismiss: (result: Result) => void;
};

export const ColorPickerContext = createContext<ColorPickerContext>({
  extraData: createRef(),
  modal: createRef(),
  onDismiss: () => {
    return;
  },
});
