import React from 'react';

export declare type MapBottomSheet = MapBottomSheetMethods;

declare const MapBottomSheet: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    MapBottomSheetProps & React.RefAttributes<MapBottomSheetMethods>
  >
>;

export interface MapBottomSheetProps {
  initialIndex?: number;
  onPressAddLocation: () => void;
  snapPoints?: (string | number)[];
}

export interface MapBottomSheetMethods {
  dismiss: () => void;
  collapse: () => void;
  present: () => void;
}
