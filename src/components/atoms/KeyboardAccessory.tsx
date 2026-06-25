import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Platform,
  StyleSheet,
  View,
  type KeyboardEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type KeyboardAccessoryProps = {
  visible?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  // Optional extra space between keyboard and accessory.
  gap?: number;
};

export function KeyboardAccessory({
  visible = true,
  children,
  style,
  gap = 0,
}: KeyboardAccessoryProps) {
  const [barHeight, setBarHeight] = useState(0);

  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const onKeyboardMove = (e: KeyboardEvent) => {
      Keyboard.scheduleLayoutAnimation(e);
      const keyboardHeight = e.endCoordinates?.height ?? 0;
      const duration = e.duration ?? 250;
      const show = visible && keyboardHeight > 0;

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: show ? -(keyboardHeight + gap) : barHeight,
          duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: show ? 1 : 0,
          duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    };

    const onKeyboardHide = (e: KeyboardEvent) => {
      Keyboard.scheduleLayoutAnimation(e);
      const duration = e.duration ?? 250;

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: barHeight,
          duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    };

    const kbWillShowSub = Keyboard.addListener(
      'keyboardWillShow',
      onKeyboardMove,
    );
    const kbWillChangeFrameSub = Keyboard.addListener(
      'keyboardWillChangeFrame',
      onKeyboardMove,
    );
    const kbWillHideSub = Keyboard.addListener(
      'keyboardWillHide',
      onKeyboardHide,
    );

    return () => {
      kbWillShowSub.remove();
      kbWillChangeFrameSub.remove();
      kbWillHideSub.remove();
    };
  }, [visible, gap, barHeight, opacity, translateY]);

  useEffect(() => {
    if (!visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: barHeight,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, barHeight, opacity, translateY]);

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && h !== barHeight) {
      setBarHeight(h);
      translateY.setValue(h);
    }
  };

  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      onLayout={onLayout}
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <View style={[styles.content, style]}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  content: {
    backgroundColor: '#F2F2F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D1D1D6',
  },
});
