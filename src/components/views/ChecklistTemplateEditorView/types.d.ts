import React from 'react';
import { ViewStyle } from 'react-native/types';

export declare type ChecklistTemplateEditorView = ChecklistTemplateEditorViewMethods;

declare const ChecklistTemplateEditorView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
  ChecklistTemplateEditorViewProps & React.RefAttributes<ChecklistTemplateEditorViewMethods>
  >
>;

export interface ChecklistTemplateEditorViewProps {
  checklistTemplateId?: string;
};

export interface ChecklistTemplateEditorViewMethods {};
