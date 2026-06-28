import React from 'react';
import { Pressable } from 'react-native';

import { useTheme } from '@react-native-hello/ui';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

// A minimal back button (chevron only) for use in navigatorScreenOptions.
// Root screen visibility is controlled by the canGoBack guard in the item
// callback, so this component always renders when mounted.
export const BackButton = ({ color }: { color?: string }) => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
      <ChevronLeft
        size={36}
        strokeWidth={2}
        color={color || theme.colors.screenHeaderButtonText}
      />
    </Pressable>
  );
};
