import { AppTheme, useTheme } from 'theme';
import React, { useImperativeHandle } from 'react';
import { FlipCardViewMethods, FlipCardViewProps } from './types';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { makeStyles } from '@rneui/themed';

type FlipCardView = FlipCardViewMethods;

const FlipCardView = React.forwardRef<FlipCardView, FlipCardViewProps>((props, ref) => {
  const { cardStyle, direction = 'y', duration = 500, FrontContent, BackContent } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  const isFlipped = useSharedValue(false);
  const isDirectionX = direction === 'x';

  useImperativeHandle(ref, () => ({
    //  These functions exposed to the parent component through the ref.
    flip,
  }));

  const flip = () => {
    isFlipped.value = !isFlipped.value;
  };

  const frontCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });

    return {
      ...(spinValue === 0 ? { zIndex: 2 } : { zIndex: 1, backfaceVisibility: 'hidden' }),
      transform: [isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue }],
    };
  });

  const backCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });

    return {
      ...(spinValue === 360 ? { zIndex: 2, backfaceVisibility: 'hidden' } : { zIndex: 1 }),
      transform: [isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue }],
    };
  });

  const ClonedFrontContent = React.cloneElement(FrontContent, { flip: flip });
  const ClonedBackContent = React.cloneElement(BackContent, { flip: flip });

  return (
    <Animated.View entering={FadeIn}>
      <Animated.View style={[s.front, cardStyle, frontCardAnimatedStyle]}>
        {ClonedFrontContent}
      </Animated.View>
      <Animated.View style={[s.back, cardStyle, backCardAnimatedStyle]}>
        {ClonedBackContent}
      </Animated.View>
    </Animated.View>
  );
});

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  front: {
    position: 'absolute',
  },
  back: {},
}));

export default FlipCardView;
