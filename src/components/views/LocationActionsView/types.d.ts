import React from 'react';

export declare type LocationActionsView = LocationActionsViewMethods;

declare const LocationActionsView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    LocationActionsViewProps & React.RefAttributes<LocationActionsViewMethods>
  >
>;

export interface LocationActionsViewProps {
  mode: 'default' | 'edit';
  showDelete: boolean;
  style?: ViewStyle | ViewStyle[];
  onPressDelete: () => void;
  onPressDone: () => void;
  onPressEdit: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LocationActionsViewMethods {}
