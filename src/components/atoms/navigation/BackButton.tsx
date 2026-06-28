import React from 'react';
import { Pressable } from 'react-native';

import { useTheme } from '@react-native-hello/ui';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

// A minimal back button (chevron only) for use in navigatorScreenOptions.
// Root screen visibility is controlled by the canGoBack guard in the item
// callback, so this component always renders when mounted.
// Pass onPress to override the default goBack behavior (e.g. nested navigators).
export const BackButton = ({
  color,
  onPress,
}: {
  color?: string;
  onPress?: () => void;
}) => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <Pressable onPress={onPress || (() => navigation.goBack())} hitSlop={8}>
      <ChevronLeft
        size={33}
        color={color || theme.colors.screenHeaderButtonText}
      />
    </Pressable>
  );
};
