import React, { ReactElement } from 'react';
import { View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  ProgressRing,
  ThemeManager,
  getColoredSvg,
  useTheme,
} from '@react-native-hello/ui';

interface TimerFaceInterface {
  caretPosition?: number;
  children?: ReactElement;
  color1?: string;
  color2?: string;
  containerStyle?: ViewStyle | ViewStyle[];
  height?: number;
  value: number; // milliseconds
  width?: number;
}

const TimerFace = ({
  caretPosition,
  children,
  color1,
  color2,
  containerStyle,
  height,
  value,
  width,
}: TimerFaceInterface) => {
  const theme = useTheme();
  const s = useStyles();

  const millseconds = value;
  const seconds = Math.trunc(millseconds / 1000);
  const preciseSeconds = millseconds / 1000;
  const minutes = Math.trunc(seconds / 60);

  return (
    <View
      style={[
        s.container,
        { width: width || '100%', height: height || '100%' },
        containerStyle,
      ]}>
      {/* Rotating caret container */}
      <View
        style={[
          s.caretContainer,
          { transform: [{ rotate: `${6 * preciseSeconds}deg` }] },
        ]}>
        {/* Caret */}
        {caretPosition && caretPosition > 0 ? (
          <View style={[s.caret, { bottom: caretPosition }]} />
        ) : null}
      </View>
      {/* Timer ring image */}
      <View style={s.backgroundImage}>
        <SvgXml
          xml={getColoredSvg('timer3')}
          width={'100%'}
          height={'100%'}
          color={theme.colors.whiteTransparentLight}
          style={s.image}
        />
        <SvgXml
          xml={getColoredSvg('timer30')}
          width={'100%'}
          height={'100%'}
          color={theme.colors.brandSecondary}
        />
      </View>
      <ProgressRing
        radius={120}
        animationDuration={0}
        color1={
          millseconds >= 0
            ? minutes % 2 === 0
              ? color1 || theme.colors.brandPrimary
              : color2 || theme.colors.brandSecondary
            : // Negative for countdown timer
              minutes % 2 === 0
              ? color1 || theme.colors.assertive
              : color2 || theme.colors.assertiveMuted
        }
        color2={
          millseconds >= 0
            ? minutes % 2 === 0
              ? color2 || theme.colors.brandSecondary
              : color1 || theme.colors.brandPrimary
            : // Negative for countdown timer
              minutes % 2 === 0
              ? color2 || theme.colors.assertiveMuted
              : color1 || theme.colors.assertive
        }
        lineCap={'butt'}
        containerStyle={s.progressContainer}
        progress={(millseconds / 1000 / 60) % 1}
      />
      <View style={s.children}>{children}</View>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  backgroundImage: {
    width: '100%',
  },
  caret: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10, // side
    borderRightWidth: 10, // side
    borderBottomWidth: 12, // base
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: theme.colors.assertive,
  },
  caretContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  children: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
    transform: [{ scale: 0.95 }],
  },
  progressContainer: {
    position: 'absolute',
    alignSelf: 'center',
    ...theme.shadow.glow,
  },
}));

export default TimerFace;
