import React, { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { MapType } from 'react-native-maps';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import { GlassView } from 'components/atoms/GlassView';
import {
  Map,
  MapPinPlus,
  Navigation,
  Navigation2,
  Satellite,
} from 'lucide-react-native';

interface MapActionButtonsProps {
  animatedPosition: Readonly<SharedValue<number>>;
  mapIsCentered: boolean;
  mapIsRotated: boolean;
  mapPresentation: MapType;
  onAddLocation: () => void;
  onRecenter: () => void;
  onNorthUp: () => void;
  onTogglePresentation: () => void;
}

// Fade buttons as the sheet rises above its 40% snap toward 80%.
const screenHeight = Dimensions.get('window').height;
const VISIBLE_Y = screenHeight * 0.55;
const HIDDEN_Y = VISIBLE_Y - 100;

const MapActionButtons = ({
  animatedPosition,
  mapIsCentered,
  mapIsRotated,
  mapPresentation,
  onAddLocation,
  onRecenter,
  onNorthUp,
  onTogglePresentation,
}: MapActionButtonsProps): React.ReactElement => {
  const theme = useTheme();
  const s = useStyles();
  const [buttonsHeight, setButtonsHeight] = useState(0);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedPosition.value,
      [HIDDEN_Y, VISIBLE_Y],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      top: animatedPosition.value - buttonsHeight - 15,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[s.container, animatedStyle]}
      onLayout={e => setButtonsHeight(e.nativeEvent.layout.height)}>
      <GlassView style={s.buttonGroup}>
        <Button
          containerStyle={s.buttonGlass}
          buttonStyle={s.buttonGlassInner}
          icon={
            <MapPinPlus
              color={theme.colors.screenHeaderButtonText}
              size={22}
            />
          }
          onPress={onAddLocation}
        />
      </GlassView>
      <GlassView style={[s.buttonGroup, s.buttonGroupLast]}>
        <Button
          containerStyle={s.buttonGlass}
          buttonStyle={s.buttonGlassInner}
          icon={
            <Navigation
              color={theme.colors.clearButtonText}
              size={22}
              fill={
                mapIsCentered
                  ? theme.colors.clearButtonText
                  : theme.colors.transparent
              }
            />
          }
          onPress={onRecenter}
        />
        <View style={s.buttonSeparator} />
        <Button
          containerStyle={s.buttonGlass}
          buttonStyle={s.buttonGlassInner}
          icon={
            <>
              <View style={s.northUp} />
              <Navigation2
                color={theme.colors.clearButtonText}
                size={20}
                fill={
                  mapIsRotated
                    ? theme.colors.transparent
                    : theme.colors.clearButtonText
                }
              />
            </>
          }
          onPress={onNorthUp}
        />
        <View style={s.buttonSeparator} />
        <Button
          containerStyle={s.buttonGlass}
          buttonStyle={s.buttonGlassInner}
          icon={
            mapPresentation === 'standard' ? (
              <Satellite color={theme.colors.clearButtonText} size={22} />
            ) : (
              <Map color={theme.colors.clearButtonText} size={22} />
            )
          }
          onPress={onTogglePresentation}
        />
      </GlassView>
    </Animated.View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  buttonGlass: {
    backgroundColor: 'transparent',
  },
  buttonGlassInner: {
    backgroundColor: 'transparent',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 10,
  },
  buttonGroupLast: {
    marginBottom: 0,
  },
  buttonSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.blackTransparentLight,
  },
  container: {
    position: 'absolute',
    right: 15,
  },
  northUp: {
    borderColor: theme.colors.clearButtonText,
    borderWidth: 1,
    borderRadius: 1,
    width: 2,
    height: 6,
    alignSelf: 'center',
  },
}));

export { MapActionButtons };
