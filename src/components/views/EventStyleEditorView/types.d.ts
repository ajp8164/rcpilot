import { EditorState } from 'lib/useEditorOnChange';
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
  onChange: (editorState: EditorState) => void;
};

export interface EventStyleEditorViewMethods {
  save: () => void;
};
