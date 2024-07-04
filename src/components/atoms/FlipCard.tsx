import { makeStyles } from '@rneui/themed';
import React from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  AnimatedProps,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AppTheme, useTheme } from 'theme';

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
  const theme = useTheme();
  const s = useStyles(theme);

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
      entering={FadeIn}
      {...containerProps}
      onTouchEnd={event => {
        if (spin.value === 0) {
          event.stopPropagation();
          spin.value = spin.value ? 0 : 1;
        }
        console.log('pressed ', event.nativeEvent);
      }}>
      <AnimatedView style={[s.front, rStyle]}>{frontItem}</AnimatedView>
      <AnimatedView style={[s.back, bStyle]}>{backItem}</AnimatedView>
    </AnimatedView>
  );
};

export default FlipCard;

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
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
}));
