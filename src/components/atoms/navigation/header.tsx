import React from 'react';

import type {
  NativeStackHeaderItem,
  NativeStackHeaderItemProps,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

type HeaderCustomElement = React.ReactElement;

const item = (
  element: HeaderCustomElement,
  hidesSharedBackground?: boolean,
): NativeStackHeaderItem => ({
  type: 'custom',
  element,
  hidesSharedBackground,
});

interface HeaderOptionsInterface extends NativeStackNavigationOptions {
  tintColor?: string;
  left?: HeaderCustomElement[];
  right?: HeaderCustomElement[];
}

// Provides a wrapper for header left/right elements. Introduced for iOS 26+ compatibilty when not
// wanting to choose to use the button glass ui "pill" effect.
export const headerOptions = ({
  tintColor,
  left,
  right,
  ...rest
}: HeaderOptionsInterface): Partial<NativeStackNavigationOptions> => {
  return {
    headerTransparent: true,
    headerBlurEffect: 'none',
    headerBackground: () => null,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: 'transparent' },
    headerTintColor: tintColor,

    unstable_headerLeftItems: left?.length
      ? (_props: NativeStackHeaderItemProps) => left.map(c => item(c))
      : undefined,

    unstable_headerRightItems: right?.length
      ? (_props: NativeStackHeaderItemProps) => right.map(c => item(c))
      : undefined,

    ...rest,
  };
};
