import React from 'react';
import { SharedValue } from 'react-native-reanimated';

export declare type ClubBottomSheet = ClubBottomSheetMethods;

declare const ClubBottomSheet: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ClubBottomSheetProps & React.RefAttributes<ClubBottomSheetMethods>
  >
>;

export interface ClubBottomSheetProps {
  animatedPosition?: SharedValue<number>;
  onDismiss?: () => void;
}

export interface ClubBottomSheetMethods {
  dismiss: () => void;
  present: (clubId: string) => void;
}
