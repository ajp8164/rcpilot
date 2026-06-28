import React from 'react';
import { SharedValue } from 'react-native-reanimated';

export declare type MapBottomSheet = MapBottomSheetMethods;

declare const MapBottomSheet: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    MapBottomSheetProps & React.RefAttributes<MapBottomSheetMethods>
  >
>;

export interface MapBottomSheetProps {
  animatedPosition?: SharedValue<number>;
  topInset?: number;
  onPressAddLocation: () => void;
}

export interface MapBottomSheetMethods {
  dismiss: () => void;
  present: () => void;
}
