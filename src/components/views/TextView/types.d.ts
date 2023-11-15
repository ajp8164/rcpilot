import { DimensionValue, ViewStyle } from 'react-native/types';

import React from 'react';

export declare type TextView = TextViewMethods;

declare const TextView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    TextViewProps & React.RefAttributes<TextViewMethods>
  >
>;

export interface TextViewProps {
  characterLimit?: number;
  containerStyle?: ViewStyle | ViewStyle[];
  onTextChanged: (text: string) => void;
  placeholder?: string;
  value?: string;
}

export interface TextViewMethods {
  getText: () => void;
}
