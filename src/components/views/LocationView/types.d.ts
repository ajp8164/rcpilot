import React, { ReactElement } from 'react';

export declare type LocationView = LocationViewMethods;

declare const LocationView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    LocationViewProps & React.RefAttributes<LocationViewMethods>
  >
>;

export interface LocationViewProps {
  locationId?: string;
  onFocusName: () => void;
  onBlurName: () => void;
  onPressNotes: (text?: string, title?: string) => void;
  titleRightContent?: ReactElement;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LocationViewMethods {}
