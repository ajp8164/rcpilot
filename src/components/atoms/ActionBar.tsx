import React, { ReactNode } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ThemeManager } from '@react-native-hello/ui';

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
  const s = useStyles();

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

const useStyles = ThemeManager.createStyleSheet(({ theme, device }) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: buttonSize + device.insets.bottom,
    paddingTop: 5,
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
    marginTop: -device.insets.bottom + 10,
  },
  actionContainerStart: {
    paddingLeft: 15,
  },
  actionContainerEnd: {
    paddingRight: 15,
  },
  actionButton: {
    top: -3,
    minWidth: buttonSize,
    height: buttonSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...theme.text.normal,
    color: theme.colors.screenHeaderButtonText,
  },
}));

export default ActionBar;
