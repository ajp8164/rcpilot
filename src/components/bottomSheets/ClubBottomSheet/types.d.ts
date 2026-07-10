import React from 'react';

export declare type ClubBottomSheet = ClubBottomSheetMethods;

declare const ClubBottomSheet: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ClubBottomSheetProps & React.RefAttributes<ClubBottomSheetMethods>
  >
>;

export interface ClubBottomSheetProps {
  onDismiss?: () => void;
}

export interface ClubBottomSheetMethods {
  dismiss: () => void;
  present: (clubId: string) => void;
}
