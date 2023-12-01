import React from 'react';
import { ViewStyle } from 'react-native/types';

export declare type ModelCategoryEditorView = ModelCategoryEditorViewMethods;

declare const ModelCategoryEditorView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
  ModelCategoryEditorViewProps & React.RefAttributes<ModelCategoryEditorViewMethods>
  >
>;

export interface ModelCategoryEditorViewProps {
  modelCategoryId?: string;
};

export interface ModelCategoryEditorViewMethods {};
