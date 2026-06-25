import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@react-native-hello/ui';
import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackHeaderItem,
  NativeStackHeaderItemProps,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';

// A minimal back button (chevron only, no glass pill) rendered when no explicit
// left items are provided to headerOptions.
export const BackButton = ({ color }: { color?: string }) => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
      <ChevronLeft
        size={36}
        strokeWidth={2}
        color={color || theme.colors.screenHeaderButtonText}
        style={{ marginLeft: -16 }}
      />
    </Pressable>
  );
};

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
// the buttonIndex used for consistent spacing. Items hide the shared (glass)
// background so headers render plain buttons rather than the iOS 26 "pill".
// Edge items get a negative margin to compensate for the extra inset iOS applies
// when the pill background is hidden.
const mapItems = (elements?: HeaderItemElement[], side?: 'left' | 'right') =>
  elements?.length
    ? (_props: NativeStackHeaderItemProps) =>
        elements.map((element, index) => {
          const cloned = React.cloneElement(element, {
            key: element.key ?? index,
            ...(isHeaderItem(element) ? { buttonIndex: index } : {}),
          });

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
  // When left is undefined, a custom back chevron is rendered (no pill).
  // Pass an explicit empty array [] to hide the back button entirely.
  left?: HeaderItemElement[];
  right?: HeaderItemElement[];
}

// Provides a uniform set of native stack header options for the app. Renders the
// supplied left/right elements via the stack's header item API and applies the
// standard transparent header treatment. Introduced for iOS 26+ compatibility
// when not wanting to use the button glass ui "pill" effect.
export const headerOptions = ({
  tintColor,
  left,
  right,
  ...rest
}: HeaderOptionsInterface): Partial<NativeStackNavigationOptions> => {
  // When left is explicitly provided (even empty []), use it directly.
  // When left is undefined, render a custom back button without the glass pill.
  const leftItems =
    left !== undefined
      ? mapItems(left, 'left')
      : (props: NativeStackHeaderItemProps) => [
          item(
            <BackButton color={tintColor || props.tintColor} />,
            true,
          ),
        ];

  const isOpaque = rest.headerTransparent === false;

  return {
    ...(isOpaque
      ? { headerTransparent: false }
      : {
          headerTransparent: true,
          headerBlurEffect: 'none',
          headerBackground: () => null,
          headerStyle: { backgroundColor: 'transparent' },
        }),
    headerShadowVisible: false,
    ...(tintColor ? { headerTintColor: tintColor } : {}),
    headerBackButtonDisplayMode: 'minimal',
    headerBackVisible: false,

    unstable_headerLeftItems: leftItems,
    unstable_headerRightItems: mapItems(right, 'right'),

    ...rest,
  };
};
