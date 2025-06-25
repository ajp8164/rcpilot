import React from 'react';
import { AnimatedStyle, SharedValue } from 'react-native-reanimated';
import { StyleProp, ViewStyle } from 'react-native';

export declare type FlipCardView = FlipCardViewMethods;

declare const TextView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    FlipCardViewProps & React.RefAttributes<FlipCardViewMethods>
  >
>;

export interface FlipCardViewProps {
  cardStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  containerStyle?: ViewStyle;
  direction?: 'x' | 'y';
  duration?: number;
  isFlipped: SharedValue<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FrontContent: ReactElement<any, string | JSXElementConstructor<any>>; //ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BackContent: ReactElement<any, string | JSXElementConstructor<any>>; //ReactNode;
}

export interface FlipCardViewMethods {
  flip?: () => void;
}
