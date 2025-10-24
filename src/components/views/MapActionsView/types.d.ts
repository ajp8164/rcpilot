import React from 'react';

export declare type MapActionsView = MapActionsViewMethods;

declare const MapActionsView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    MapActionsViewProps & React.RefAttributes<MapActionsViewMethods>
  >
>;

export interface MapActionsViewProps {
  onPressAddLocation: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MapActionsViewMethods {}
