import { AppTheme, useTheme } from 'theme';
import { Pressable, Text } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome6';
import React from 'react';
import { makeStyles } from '@rneui/themed';

interface CircleButtonInterface {
  icon: string;
  onPress: () => void;
  size?: number;
  style?: any;
  text?: string;
}

const CircleButton = ({
  icon,
  onPress,
  size = 50,
  style,
  text,
}: CircleButtonInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <Pressable
      style={s.buttonWrapper}
      onPress={onPress}>
      <Icon
        name={'circle'}
        style={[s.buttonOutline, {fontSize: size}]}
      />
      <Icon
        name={icon}
        style={[s.buttonIcon, {fontSize: size * 0.6}, style]}
      />
      <Text style={s.buttonText}>{text}</Text>
    </Pressable>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  buttonIcon: {
    position: 'absolute',
    color: theme.colors.whiteTransparentMid,
  },
  buttonOutline: {
    color: theme.colors.whiteTransparentMid,
  },
  buttonText: {
    ...theme.styles.textTiny,
    ...theme.styles.textBold,
    color: theme.colors.whiteTransparentMid,
    position: 'absolute',
    bottom: -20,
    textAlign: 'center',
    width: '100%',    
  },
  buttonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
}));

export default CircleButton;
