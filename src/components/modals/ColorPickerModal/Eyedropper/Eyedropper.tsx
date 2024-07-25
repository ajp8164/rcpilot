import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  AlphaType,
  Canvas,
  ColorType,
  Fill,
  Image,
  ImageShader,
  Shader,
  Skia,
  type SkImage,
} from '@shopify/react-native-skia';

import { EYE_DROPPER_SHADER } from './shader';
import { useVector } from './useVector';
import { viewport } from '@react-native-ajp-elements/ui';
import { AppTheme, useTheme } from 'theme';
import { makeStyles } from '@rneui/themed';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const SHADER = Skia.RuntimeEffect.Make(EYE_DROPPER_SHADER)!;

const { width, height } = viewport;
const SIZE = width * 0.45;

interface EyedropperInterface {
  image: SkImage;
  onSelectColor: (color: string) => void;
  setImage: Dispatch<SetStateAction<SkImage | null>>;
}

const Eyedropper = ({ image, onSelectColor, setImage }: EyedropperInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const translate = useVector(0, 0);
  const offset = useVector(0, 0);
  const scale = useSharedValue<number>(0);

  const onEnd = () => {
    const resizerX = image.width() / width;
    const resizerY = image.height() / height;
    const x = (width / 2 + translate.x.value) * resizerX;
    const y = (height / 2 + translate.y.value) * resizerY;

    const pixels = image.readPixels(x, y, {
      colorType: ColorType.RGBA_F32,
      alphaType: AlphaType.Premul,
      height: 1,
      width: 1,
    });

    if (pixels === null) return;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const r = clamp(Math.round(pixels[0]! * 255), 0, 255);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const g = clamp(Math.round(pixels[1]! * 255), 0, 255);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const b = clamp(Math.round(pixels[2]! * 255), 0, 255);

    onSelectColor(`rgba(${r}, ${g}, ${b}, 1)`);

    translate.x.value = 0;
    translate.y.value = 0;
    setImage(null);
  };

  const uniforms = useDerivedValue(() => {
    return {
      size: [SIZE, SIZE],
      nestedSize: [width, height],
      gesturePos: [width / 2 + translate.x.value, height / 2 + translate.y.value],
    };
  });

  const pan = Gesture.Pan()
    .onStart(e => {
      offset.x.value = e.x - width / 2;
      offset.y.value = e.y - height / 2;
    })
    .onUpdate(e => {
      translate.x.value = offset.x.value + e.translationX;
      translate.y.value = offset.y.value + e.translationY;
    })
    .onEnd(() => {
      scale.value = withTiming(0, undefined, () => {
        runOnJS(onEnd)();
      });
    });

  const selectorStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translate.x.value },
      { translateY: translate.y.value },
      { scale: scale.value },
    ],
  }));

  useEffect(() => {
    scale.value = withTiming(1);
  }, [scale]);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={s.root}>
        <Canvas style={s.backgroundCanvas}>
          <Image image={image} x={0} y={0} width={width} height={height} fit={'cover'} />
        </Canvas>
        <Animated.View style={[s.container, selectorStyles]}>
          <Canvas style={s.container}>
            <Fill>
              <Shader source={SHADER} uniforms={uniforms}>
                {image && (
                  <ImageShader
                    image={image}
                    fit={'cover'}
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                  />
                )}
              </Shader>
            </Fill>
          </Canvas>
          <View style={s.indicator} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  root: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  backgroundCanvas: {
    width,
    height,
    position: 'absolute',
  },
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  indicator: {
    width: SIZE / 11 + 2,
    height: SIZE / 11 + 2,
    borderWidth: 3,
    borderColor: theme.colors.stickyWhite,
    position: 'absolute',
  },
}));

export { Eyedropper };
