import React from 'react';
import { ViewStyle } from 'react-native/types';

export declare type ModelView = ModelViewMethods;

declare const TextView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ModelViewProps & React.RefAttributes<ModelViewMethods>
  >
>;

export interface ModelViewProps {
  modelId?: string;
};

export interface ModelViewMethods {};
