import React from 'react';

export declare type ClubsBottomSheet = ClubsBottomSheetMethods;

declare const ClubsBottomSheet: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ClubsBottomSheetProps & React.RefAttributes<ClubsBottomSheetMethods>
  >
>;

export interface ClubsBottomSheetProps {
  onDismiss?: () => void;
  onPressClub?: (clubId: string) => void;
}

export interface ClubsBottomSheetMethods {
  dismiss: (restoreMap?: boolean) => void;
  getCurrentIndex: () => number;
  present: () => void;
  snapToIndex: (index: number) => void;
}
