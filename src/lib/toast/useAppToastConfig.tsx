import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { ToastConfigParams } from 'react-native-toast-message';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { CircleAlert, ThumbsUp, Wifi } from 'lucide-react-native';

export const useAppToastConfig = () => {
  const theme = useTheme();
  const s = useStyles();

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activity: ({ text1 }: ToastConfigParams<any>) => (
      <View style={[s.container]}>
        <ActivityIndicator color={theme.colors.textInv} size={'small'} />
        <Text style={s.text}>{text1}</Text>
      </View>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: ({ text1 }: ToastConfigParams<any>) => (
      <View style={[s.container, s.errorContainer]}>
        <CircleAlert color={theme.colors.textInv} size={20} />
        <Text style={s.text}>{text1}</Text>
      </View>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    networkConnection: ({ text1 }: ToastConfigParams<any>) => (
      <View style={[s.container, s.warningContainer]}>
        <Wifi color={theme.colors.buttonText} size={20} />
        <Text style={s.text}>{text1}</Text>
      </View>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    success: ({ text1 }: ToastConfigParams<any>) => (
      <View style={[s.container, s.successContainer]}>
        <ThumbsUp color={theme.colors.textInv} size={20} />
        <Text style={s.text}>{text1}</Text>
      </View>
    ),
  };
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    width: '60%',
    height: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.M,
    backgroundColor: theme.colors.brandSecondary,
    flexDirection: 'row',
  },
  errorContainer: {
    backgroundColor: theme.colors.assertive,
  },
  successContainer: {
    backgroundColor: theme.colors.success,
  },
  warningContainer: {
    backgroundColor: theme.colors.warning,
  },
  text: {
    ...theme.text.small,
    color: theme.colors.textInv,
    marginLeft: 7,
  },
}));
