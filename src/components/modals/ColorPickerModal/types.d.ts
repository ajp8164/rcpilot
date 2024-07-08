import React from 'react';

export declare type ColorPickerModal = ColorPickerModalMethods;

declare const LegalModal: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ColorPickerModalProps & React.RefAttributes<ColorPickerModalMethods>
  >
>;

export interface ColorPickerModalProps {
  onSelectColor: (color: string) => void;
  snapPoints?: (string | number)[];
}

export interface ColorPickerModalMethods {
  dismiss: () => void;
  present: (initialColor?: string) => void;
}
