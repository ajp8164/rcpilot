import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useKeyboardHeight } from 'lib/useKeyboardHeight';
import Animated, { FadeIn } from 'react-native-reanimated';

type KeyboardAccessoryProps = {
  visible?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

// Keyboard accessory bar that sticks to the keyboard and animates with it.
// Uses KeyboardStickyView from react-native-keyboard-controller.
// Must be placed at the bottom of its parent container for correct positioning.
export function KeyboardAccessory({
  visible = true,
  children,
  style,
}: KeyboardAccessoryProps) {
  const kbHeight = useKeyboardHeight();

  if (!visible || !kbHeight) return null;

  return (
    <Animated.View entering={FadeIn}>
      <KeyboardStickyView offset={{ closed: 0, opened: kbHeight }}>
        <View style={style}>{children}</View>
      </KeyboardStickyView>
    </Animated.View>
  );
}
