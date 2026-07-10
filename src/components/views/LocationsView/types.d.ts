import React from 'react';

export declare type LocationsView = LocationsViewMethods;

declare const LocationsView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    LocationsViewProps & React.RefAttributes<LocationsViewMethods>
  >
>;

export interface LocationsViewProps {
  ListHeaderComponent?: React.ReactElement;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LocationsViewMethods {}
