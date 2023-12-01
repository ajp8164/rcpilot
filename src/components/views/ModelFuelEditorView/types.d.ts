import React from 'react';
import { ViewStyle } from 'react-native/types';

export declare type ModelFuelEditorView = ModelFuelEditorViewMethods;

declare const ModelFuelEditorView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
  ModelFuelEditorViewProps & React.RefAttributes<ModelFuelEditorViewMethods>
  >
>;

export interface ModelFuelEditorViewProps {
  modelFuelId?: string;
};

export interface ModelFuelEditorViewMethods {};
