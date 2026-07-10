import React from 'react';

export declare type ClubsListView = ClubsListViewMethods;

declare const ClubsListView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ClubsListViewProps & React.RefAttributes<ClubsListViewMethods>
  >
>;

export interface ClubsListViewProps {
  ListHeaderComponent?: React.ReactElement;
  useBottomSheetList?: boolean;
  onPressClub?: (clubId: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ClubsListViewMethods {}
