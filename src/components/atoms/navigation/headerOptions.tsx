import React from 'react';
import { View } from 'react-native';

import type {
  NativeStackHeaderItem,
  NativeStackHeaderItemProps,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import { GLASS_UI } from './config';

export type HeaderItemProps = {
  // Position of the item within its left/right group. Injected by headerOptions
  // so header components can adjust spacing (e.g. icon offsets) consistently.
  buttonIndex?: number;
};

type HeaderItemElement = React.ReactElement<HeaderItemProps>;

// Header item components (HeaderIconButton, HeaderButton, ...) set this static
// flag so headerOptions can recognize them and inject layout context without
// being coupled to a hardcoded list of component types.
type HeaderItemComponent = { isHeaderItem?: boolean };

const isHeaderItem = (element: HeaderItemElement): boolean =>
  !!(element.type as HeaderItemComponent)?.isHeaderItem;

const item = (
  element: HeaderItemElement,
  hidesSharedBackground?: boolean,
): NativeStackHeaderItem => ({
  type: 'custom',
  element,
  hidesSharedBackground,
});

// Clones each element to attach a stable key and, for recognized header items,
// the buttonIndex used for consistent spacing. When GLASS_UI is disabled, items
// hide the shared background and get edge margin offsets.
const mapItems = (elements?: HeaderItemElement[], side?: 'left' | 'right') =>
  elements?.length
    ? (_props: NativeStackHeaderItemProps) =>
        elements.map((element, index) => {
          const cloned = React.cloneElement(element, {
            key: element.key ?? index,
            ...(isHeaderItem(element) ? { buttonIndex: index } : {}),
          });

          if (GLASS_UI) {
            return item(cloned, false);
          }

          // Wrap edge items with a margin offset to align with screen edges.
          const isFirstLeft = index === 0 && side === 'left';
          const isLastRight =
            index === elements.length - 1 && side === 'right';

          if (isFirstLeft || isLastRight) {
            return item(
              <View
                style={
                  isFirstLeft
                    ? { marginLeft: -8 }
                    : { marginRight: -8 }
                }>
                {cloned}
              </View>,
              true,
            );
          }

          return item(cloned, true);
        })
    : undefined;

interface HeaderOptionsInterface extends NativeStackNavigationOptions {
  tintColor?: string;
  // When left is undefined, the navigator-level back button applies.
  // Pass an explicit empty array [] to hide the back button entirely.
  left?: HeaderItemElement[];
  right?: HeaderItemElement[];
}

// Provides per-screen header options for the native stack. Renders the supplied
// left/right elements via the stack's header item API. Supports transparent
// headers and consistent button styling across GLASS_UI on/off modes.
export const headerOptions = ({
  tintColor,
  left,
  right,
  ...rest
}: HeaderOptionsInterface): Partial<NativeStackNavigationOptions> => {
  // When left is explicitly provided (even empty []), use it directly.
  // When left is undefined, don't set unstable_headerLeftItems so the
  // navigator-level custom back button (from navigatorScreenOptions) applies.
  const leftItems =
    left !== undefined
      ? mapItems(left, 'left')
      : undefined;

  const isTransparent = rest.headerTransparent === true;

  return {
    ...(isTransparent
      ? {
          headerTransparent: true,
          headerBlurEffect: 'none',
          headerBackground: () => null,
          headerStyle: { backgroundColor: 'transparent' },
        }
      : {}),
    headerShadowVisible: false,
    ...(tintColor ? { headerTintColor: tintColor } : {}),

    ...(leftItems !== undefined
      ? { unstable_headerLeftItems: leftItems }
      : {}),
    unstable_headerRightItems: mapItems(right, 'right'),

    ...rest,
  };
};

