import React from 'react';

export declare type NotesBottomSheet = NotesBottomSheetMethods;

declare const NotesBottomSheet: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    NotesBottomSheetProps & React.RefAttributes<NotesBottomSheetMethods>
  >
>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NotesBottomSheetProps {
  eventName: string;
  snapPoints?: (string | number)[];
}

export interface NotesBottomSheetMethods {
  dismiss: () => void;
  present: (text?: string, title?: string) => void;
}
