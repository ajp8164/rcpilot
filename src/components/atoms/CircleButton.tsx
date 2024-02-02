import { AppTheme, useTheme } from 'theme';
import { Pressable, Text } from 'react-native';
import React, { ReactNode } from 'react';

import Icon from 'react-native-vector-icons/FontAwesome6';
import { makeStyles } from '@rneui/themed';

export type ActionBarItem = {
  ActionComponent?: ReactNode;
  label?: string;
  onPress?: () => void;
}

interface CircleButtonInterface {
  icon: string;
  text?: string;
  onPress: () => void;
  style?: any;
}

const CircleButton = ({
  icon,
  text,
  onPress,
  style,
}: CircleButtonInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <Pressable
      style={s.buttonWrapper}
      onPress={onPress}>
      <Icon
        name={'circle'}
        style={s.buttonOutline}
      />
      <Icon
        name={icon}
        style={[s.buttonIcon, style]}
      />
      <Text style={s.buttonText}>{text}</Text>
    </Pressable>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  buttonIcon: {
    position: 'absolute',
    color: theme.colors.whiteTransparentMid,
    fontSize: 30,
  },
  buttonOutline: {
    color: theme.colors.whiteTransparentMid,
    fontSize: 50,
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
