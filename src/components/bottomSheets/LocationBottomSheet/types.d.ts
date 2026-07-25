import React from 'react';
import { SharedValue } from 'react-native-reanimated';

export declare type LocationBottomSheet = LocationBottomSheetMethods;

declare const LocationBottomSheet: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    LocationBottomSheetProps & React.RefAttributes<LocationBottomSheetMethods>
  >
>;

export interface LocationBottomSheetProps {
  animatedPosition?: SharedValue<number>;
  enableSelection?: boolean;
  initialIndex?: number;
  onDismiss?: (byUser?: boolean) => void;
  onLocationSelect?: (locationId: string) => void;
  onPressNotes: (text?: string, title?: string) => void;
}

export interface LocationBottomSheetMethods {
  dismiss: (byUser?: boolean) => void;
  getLocationId: () => string | undefined;
  present: (locationId: string, index?: number, showEditor?: boolean) => void;
}
