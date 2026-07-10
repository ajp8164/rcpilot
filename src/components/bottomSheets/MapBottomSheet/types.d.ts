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
  onPressClub?: (clubId: string) => void;
  onSnapChange?: (index: number) => void;
}

export interface MapBottomSheetMethods {
  dismiss: () => void;
  present: () => void;
  snapToIndex: (index: number) => void;
}
