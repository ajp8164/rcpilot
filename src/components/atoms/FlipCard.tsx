import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Animated, {
  AnimatedProps,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

export const FlipCard = ({
  containerProps,
  backItem,
  frontItem,
}: {
  containerProps?: AnimatedProps<ViewProps>;
  frontItem?: React.ReactNode;
  backItem?: React.ReactNode;
}) => {
  const spin = useSharedValue<number>(0);

  const rStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(spin.value, [0, 1], [0, 180]);
    return {
      transform: [
        {
          rotateY: withTiming(`${spinVal}deg`, { duration: 500 }),
        },
      ],
    };
  }, []);

  const bStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(spin.value, [0, 1], [180, 360]);
    return {
      transform: [
        {
          rotateY: withTiming(`${spinVal}deg`, { duration: 500 }),
        },
      ],
    };
  }, []);

  return (
    <AnimatedView
      // pos={'relative'}
      {...containerProps}
      onTouchEnd={() => {
        spin.value = spin.value ? 0 : 1;
        console.log('pressed');
      }}>
      <AnimatedView style={[Styles.front, rStyle]}>{frontItem}</AnimatedView>
      <AnimatedView style={[Styles.back, bStyle]}>{backItem}</AnimatedView>
    </AnimatedView>
  );
};

export default FlipCard;

const Styles = StyleSheet.create({
  front: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  back: {
    flex: 1,
    backfaceVisibility: 'hidden',
    zIndex: 10,
  },
});
