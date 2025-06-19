import { AppTheme, useTheme } from 'theme';
import {
  FlatList,
  LayoutChangeEvent,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { ReactNode } from 'react';

import { makeStyles } from '@rn-vui/themed';

const buttonSize = 44;

export type ActionBarItem = {
  ActionComponent?: ReactNode;
  label?: string;
  visible?: boolean;
  onPress?: () => void;
};

interface ActionBarInterface {
  actions: ActionBarItem[];
  onLayout?: (event: LayoutChangeEvent) => void;
}

const ActionBar = ({ actions, onLayout }: ActionBarInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const renderActions: ListRenderItem<ActionBarItem> = ({
    item: action,
    index,
  }) => {
    return (
      <View
        key={index}
        style={[
          s.actionContainer,
          index === 0 ? s.actionContainerStart : {},
          index === actions.length - 1 ? s.actionContainerEnd : {},
        ]}>
        {(action.visible === undefined ? true : action.visible) && (
          <View style={s.actionButton}>
            <Pressable onPress={action.onPress}>
              {action.ActionComponent}
              {action.label && <Text style={s.label}>{action.label}</Text>}
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={s.container} onLayout={onLayout}>
      <FlatList
        data={actions}
        renderItem={renderActions}
        keyExtractor={(_item, index) => `${index}`}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: buttonSize + theme.insets.bottom,
    backgroundColor: theme.colors.white,
    borderTopColor: theme.colors.lightGray,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  actionContainer: {
    minWidth: buttonSize,
    height: buttonSize,
    justifyContent: 'center',
    marginTop: -theme.insets.bottom,
  },
  actionContainerStart: {
    paddingLeft: 10,
  },
  actionContainerEnd: {
    paddingRight: 10,
  },
  actionButton: {
    top: -3,
    minWidth: buttonSize,
    height: buttonSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...theme.styles.textNormal,
    color: theme.colors.clearButtonText,
  },
}));

export default ActionBar;
