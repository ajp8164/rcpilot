import React from 'react';

import { BackButton } from './BackButton';

// Standard navigator-level screenOptions that suppresses the iOS 26 glass pill
// on the native back button. Apply to any navigator's screenOptions that doesn't
// use headerOptions() per-screen.
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
  unstable_headerLeftItems: (props: { tintColor?: string }) => [
    {
      type: 'custom' as const,
      element: <BackButton color={props.tintColor} />,
      hidesSharedBackground: true,
    },
  ],
});
