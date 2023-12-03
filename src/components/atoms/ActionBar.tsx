import { AppTheme, useTheme } from 'theme';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import React, { ReactNode } from 'react';

import { makeStyles } from '@rneui/themed';

export type ActionBarItem = {
  ActionComponent?: ReactNode;
  label?: string;
  onPress?: () => void;
}

interface ActionBarInterface {
  actions?: ActionBarItem[];
  onLayout?: (event: LayoutChangeEvent) => void;
}

const ActionBar = ({
  actions,
  onLayout,
}: ActionBarInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <View style={s.container} onLayout={onLayout}>
      <View style={s.contentContainer}>
        {actions?.map((action, index) => {
          return (
            <View
              key={index}
              style={s.actionContainer}>
              <Pressable onPress={action.onPress}>
                {action.ActionComponent}
                {action.label &&
                  <Text style={s.label}>
                    {action.label}
                  </Text>
                }
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60 + theme.insets.bottom,
    backgroundColor: theme.colors.white
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%'
  },
  actionContainer: {
    justifyContent: 'center',
    marginTop: -theme.insets.bottom,
    paddingHorizontal: 20
  },
  label: {
    ...theme.styles.textNormal,
    color: theme.colors.screenHeaderBackButton,
  }
}));

export default ActionBar;
