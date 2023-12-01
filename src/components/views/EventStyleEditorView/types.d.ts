import React from 'react';
import { ViewStyle } from 'react-native/types';

export declare type EventStyleEditorView = EventStyleEditorViewMethods;

declare const EventStyleEditorView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
  EventStyleEditorViewProps & React.RefAttributes<EventStyleEditorViewMethods>
  >
>;

export interface EventStyleEditorViewProps {
  eventStyleId?: string;
};

export interface EventStyleEditorViewMethods {};
