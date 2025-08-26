import React from 'react';

export declare type LocationBottomSheet = LocationBottomSheetMethods;

declare const LocationBottomSheet: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    LocationBottomSheetProps & React.RefAttributes<LocationBottomSheetMethods>
  >
>;

export interface LocationBottomSheetProps {
  onDismiss?: (byUser?: boolean) => void;
  onPressNotes: (text?: string, title?: string) => void;
  snapPoints?: (string | number)[];
}

export interface LocationBottomSheetMethods {
  dismiss: (byUser?: boolean) => void;
  present: (locationId: string) => void;
}
