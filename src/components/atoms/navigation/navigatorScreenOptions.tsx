import React from 'react';

import { BackButton } from './BackButton';

// Standard navigator-level screenOptions. Renders a custom blue chevron back
// button inside a glass pill. The BackButton component self-hides on root
// screens, and we use a wrapper that returns an empty item array on root
// to prevent an empty pill from rendering.
export const navigatorScreenOptions = (theme: {
  colors: {
    screenHeaderBackground: string;
    screenHeaderTitle: string;
    screenHeaderButtonText: string;
  };
}) => ({
  headerStyle: {
    backgroundColor: theme.colors.screenHeaderBackground,
  },
  headerTitleStyle: { color: theme.colors.screenHeaderTitle },
  headerTintColor: theme.colors.screenHeaderButtonText,
  headerBackButtonDisplayMode: 'minimal' as const,
  headerBackVisible: false,
  unstable_headerLeftItems: (props: { tintColor?: string; canGoBack?: boolean }) =>
    props.canGoBack === false
      ? []
      : [
          {
            type: 'custom' as const,
            element: <BackButton color={props.tintColor} />,
            hidesSharedBackground: false,
          },
        ],
});
