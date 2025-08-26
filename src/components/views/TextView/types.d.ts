import React from 'react';
import { ViewStyle } from 'react-native/types';

export declare type TextView = TextViewMethods;

declare const TextView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    TextViewProps & React.RefAttributes<TextViewMethods>
  >
>;

export interface TextViewProps {
  characterLimit?: number;
  containerStyle?: ViewStyle | ViewStyle[];
  // Use this height for the containing view instead of calculating internally. This is
  // needed when this component is in a bottomsheet
  height?: number;
  // If false then the keyboard will not present automatically.
  enableAutoKeyboard?: boolean;
  onTextChanged: (text: string) => void;
  placeholder?: string;
  value?: string;
}

export interface TextViewMethods {
  getText: () => void;
}
