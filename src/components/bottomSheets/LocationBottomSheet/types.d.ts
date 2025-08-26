import React from 'react';

export declare type LocationBottomSheet = LocationBottomSheetMethods;

declare const LocationBottomSheet: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    LocationBottomSheetProps & React.RefAttributes<LocationBottomSheetMethods>
  >
>;

export interface LocationBottomSheetProps {
  enableSelection?: boolean;
  onDismiss?: (byUser?: boolean) => void;
  onLocationSelect?: (locationId: string) => void;
  onPressNotes: (text?: string, title?: string) => void;
  snapPoints?: (string | number)[];
}

export interface LocationBottomSheetMethods {
  dismiss: (byUser?: boolean) => void;
  present: (locationId: string) => void;
}
