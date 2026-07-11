import React, { type ReactElement } from 'react';
import {
  Text,
  View,
  type LayoutChangeEvent,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import {
  BlurBackground,
  Button,
  ThemeManager,
  useDevice,
} from '@react-native-hello/ui';

// import { Button } from '..';
// import { BlurBackground } from '../BlurBackground';
// import { ThemeManager, useDevice } from '../theme';

interface ModalHeaderInterface {
  blurBackground?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
  leftButtonBusy?: boolean;
  leftButtonContainerStyle?: ViewStyle | ViewStyle[];
  leftButtonDisabled?: boolean;
  leftButtonText?: string;
  leftButtonTextStyle?: TextStyle | TextStyle[];
  leftButtonIcon?: ReactElement;
  onLayout?: (event: LayoutChangeEvent) => void;
  onLeftButtonPress?: () => void;
  onRightButtonPress?: () => void;
  rightButtonBusy?: boolean;
  rightButtonContainerStyle?: ViewStyle | ViewStyle[];
  rightButtonDisabled?: boolean;
  rightButtonText?: string;
  rightButtonTextStyle?: TextStyle | TextStyle[];
  rightButtonIcon?: ReactElement;
  size?: 'small' | 'large';
  title?: string;
  titleStyle?: TextStyle | TextStyle[];
}

const ModalHeader = ({
  blurBackground,
  containerStyle,
  leftButtonBusy,
  leftButtonContainerStyle,
  leftButtonDisabled,
  leftButtonText,
  leftButtonTextStyle,
  leftButtonIcon,
  onLayout,
  onLeftButtonPress,
  onRightButtonPress,
  rightButtonBusy,
  rightButtonContainerStyle,
  rightButtonDisabled,
  rightButtonText,
  rightButtonTextStyle,
  rightButtonIcon,
  size = 'large',
  title,
  titleStyle,
}: ModalHeaderInterface) => {
  const s = useStyles();
  const device = useDevice();

  const onHeaderLayout = (event: LayoutChangeEvent) => {
    if (onLayout) onLayout(event);
  };

  return (
    <>
      {blurBackground && (
        <BlurBackground
          style={{
            height:
              size === 'large'
                ? device.insets.top + Number(device.headerBarLarge.height)
                : device.insets.top + Number(device.headerBar.height),
          }}
        />
      )}
      <View
        style={[size === 'large' ? s.viewLarge : s.viewSmall, containerStyle]}
        onLayout={onHeaderLayout}>
        <Text
          style={[size === 'large' ? s.titleLarge : s.titleSmall, titleStyle]}>
          {title}
        </Text>
        <Button
          type={'clear'}
          containerStyle={[
            size === 'large' ? s.containerLeftLarge : s.containerLeftSmall,
            leftButtonContainerStyle,
          ]}
          buttonStyle={size === 'large' ? s.buttonLarge : s.buttonSmall}
          title={leftButtonText}
          titleStyle={[s.buttonText, leftButtonTextStyle]}
          loading={leftButtonBusy}
          icon={leftButtonIcon ? leftButtonIcon : undefined}
          iconContainerStyle={{ marginHorizontal: 0 }}
          disabled={leftButtonDisabled}
          onPress={onLeftButtonPress}
        />
        <Button
          type={'clear'}
          containerStyle={[
            size === 'large' ? s.containerRightLarge : s.containerRightSmall,
            rightButtonContainerStyle,
          ]}
          buttonStyle={size === 'large' ? s.buttonLarge : s.buttonSmall}
          title={rightButtonText}
          titleStyle={[s.buttonText, rightButtonTextStyle]}
          loading={rightButtonBusy}
          icon={rightButtonIcon ? rightButtonIcon : undefined}
          iconContainerStyle={{ marginHorizontal: 0 }}
          disabled={rightButtonDisabled}
          onPress={onRightButtonPress}
        />
      </View>
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  viewLarge: {
    marginLeft: theme.spacing.M,
    marginBottom: 10,
    flexDirection: 'row',
  },
  viewSmall: {
    marginHorizontal: theme.spacing.M,
    marginBottom: 10,
    alignItems: 'center',
    overflow: 'visible',
  },
  containerLeftLarge: {
    position: 'absolute',
    left: 0,
  },
  containerLeftSmall: {
    position: 'absolute',
    left: 0,
    top: 7,
  },
  containerRightLarge: {
    position: 'absolute',
    right: 0,
  },
  containerRightSmall: {
    position: 'absolute',
    right: 0,
    top: -3,
  },
  buttonLarge: {
    paddingLeft: 0,
  },
  buttonSmall: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  buttonText: {
    ...theme.text.normal,
    color: theme.colors.screenHeaderButtonText,
  },
  titleLarge: {
    ...theme.text.h2,
    fontFamily: theme.fonts.bold,
    marginTop: 45,
  },
  titleSmall: {
    ...theme.text.h4,
    fontFamily: theme.fonts.bold,
    marginVertical: 8,
  },
}));

export { ModalHeader };
