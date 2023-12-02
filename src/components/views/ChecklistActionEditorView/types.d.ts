import React from 'react';
import { ViewStyle } from 'react-native/types';

export declare type ChecklistActionEditorView = ChecklistActionEditorViewMethods;

declare const ChecklistActionEditorView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
  ChecklistActionEditorViewProps & React.RefAttributes<ChecklistActionEditorViewMethods>
  >
>;

export interface ChecklistActionEditorViewProps {
  checklistTemplateId?: string;
  actionIndex?: number;
};

export interface ChecklistActionEditorViewMethods {};
