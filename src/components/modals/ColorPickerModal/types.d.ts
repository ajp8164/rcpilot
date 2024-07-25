import React from 'react';
import { View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

export type PresentOptions = {
  color?: SharedValue<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraData?: any;
};

export type Result = {
  color: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraData?: any;
};

export declare type ColorPickerModal = ColorPickerModalMethods;

declare const LegalModal: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ColorPickerModalProps & React.RefAttributes<ColorPickerModalMethods>
  >
>;

export interface ColorPickerModalProps {
  eyedropperViewRef: React.RefObject<View>;
  snapPoints?: (string | number)[];
}

export interface ColorPickerModalMethods {
  dismiss: () => void;
  present: (opts?: PresentOptions) => void;
}
