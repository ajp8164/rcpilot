import React from 'react';
import { SharedValue } from 'react-native-reanimated';

export declare type ClubsBottomSheet = ClubsBottomSheetMethods;

declare const ClubsBottomSheet: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ClubsBottomSheetProps & React.RefAttributes<ClubsBottomSheetMethods>
  >
>;

export interface ClubsBottomSheetProps {
  animatedPosition?: SharedValue<number>;
  onDismiss?: () => void;
  onPressClub?: (clubId: string) => void;
}

export interface ClubsBottomSheetMethods {
  dismiss: (restoreMap?: boolean) => void;
  getCurrentIndex: () => number;
  present: () => void;
  snapToIndex: (index: number) => void;
}
