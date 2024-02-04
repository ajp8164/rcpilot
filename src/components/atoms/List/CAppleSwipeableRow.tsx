import { Animated, I18nManager, Pressable, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React, {
  MutableRefObject,
  ReactNode,
  Ref,
  forwardRef,
  useRef,
} from 'react';

import { Icon } from '@rneui/base';
import { Swipeable } from 'react-native-gesture-handler';
import { SwipeableItem } from '@react-native-ajp-elements/ui';
// import type { SwipeableItem } from './index';
import { makeStyles } from '@rneui/themed';

interface AppleStyleSwipeableRow {
  children: ReactNode | ReactNode[];
  enabled?: boolean;
  leftItems?: SwipeableItem[];
  onSwipeableClose?: (
    direction: 'left' | 'right',
    swipeable: Swipeable,
  ) => void;
  onSwipeableOpen?: (direction: 'left' | 'right', swipeable: Swipeable) => void;
  onSwipeableWillClose?: (direction: 'left' | 'right') => void;
  onSwipeableWillOpen?: (direction: 'left' | 'right') => void;
  position?: ('first' | 'last' | undefined)[];
  rightItems?: SwipeableItem[];
  swipeable?: React.RefObject<Swipeable>;
}

const AppleStyleSwipeableRow = forwardRef(
  (
    {
      children,
      enabled = true,
      leftItems,
      onSwipeableClose,
      onSwipeableOpen,
      onSwipeableWillClose,
      onSwipeableWillOpen,
      position,
      rightItems,
    }: AppleStyleSwipeableRow,
    ref,
  ) => {
    const theme = useTheme();
    const s = useStyles(theme);

    const myRef = useRef<Swipeable>(null);

    const assignRefs = <T,>(...refs: Ref<T | null>[]) => {
      return (node: T | null) => {
        refs.forEach(r => {
          if (typeof r === 'function') {
            r(node);
          } else if (r) {
            (r as MutableRefObject<T | null>).current = node;
          }
        });
      };
    };

    const renderLeftAction = (
      item: SwipeableItem,
      progress: Animated.AnimatedInterpolation<number>,
      firstAction: boolean,
    ) => {
      const trans = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-item.x, 0],
      });

      return (
        <Animated.View
          key={item.text}
          style={{ flex: 1, transform: [{ translateX: trans }] }}>
          <Pressable
            style={[
              s.leftAction,
              position?.includes('first') && firstAction ? s.leftActionFirst : {},
              position?.includes('last') && firstAction ? s.leftActionLast : {},
              {backgroundColor: item.color}
            ]}
            onPress={() => {
              close();
              item.onPress && item.onPress();
            }}>
            {item.icon && (
              <Icon
                name={item.icon}
                type={item.iconType}
                color={theme.colors.stickyWhite}
                size={22}
              />
            )}
            <Text style={s.actionText}>{item.text}</Text>
          </Pressable>
        </Animated.View>
      );
    };

    const renderLeftActions = (
      progress: Animated.AnimatedInterpolation<number>,
      _dragAnimatedValue: Animated.AnimatedInterpolation<number>,
    ) => {
      if (!leftItems) return null;
      return (
        <View
          style={{
            width: leftItems[0].x,
            flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
          }}>
          {leftItems.map((item, index) => {
            return renderLeftAction(item, progress, index === leftItems.length - 1);
          })}
        </View>
      );
    };

    const renderRightAction = (
      item: SwipeableItem,
      progress: Animated.AnimatedInterpolation<number>,
      lastAction: boolean,
    ) => {
      const trans = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [item.x, 0],
      });

      return (
        <Animated.View
          key={item.text}
          style={{ flex: 1, transform: [{ translateX: trans }] }}>
          <Pressable
            style={[
              s.rightAction,
              position?.includes('first') && lastAction ? s.rightActionFirst : {},
              position?.includes('last') && lastAction ? s.rightActionLast : {},
              {backgroundColor: item.color}
            ]}
            onPress={() => {
              close();
              item.onPress && item.onPress();
            }}>
            {item.icon && (
              <Icon
                name={item.icon}
                type={item.iconType}
                color={theme.colors.stickyWhite}
                size={22}
              />
            )}
            <Text style={s.actionText}>{item.text}</Text>
          </Pressable>
        </Animated.View>
      );
    };

    const renderRightActions = (
      progress: Animated.AnimatedInterpolation<number>,
      _dragAnimatedValue: Animated.AnimatedInterpolation<number>,
    ) => {
      if (!rightItems) return null;
      return (
        <View
          style={{
            width: rightItems[0].x,
            flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
          }}>
          {rightItems.map((item, index, arr) => {
            return renderRightAction(item, progress, index === arr.length - 1);
          })}
        </View>
      );
    };

    const close = () => {
      myRef.current?.close();
    };

    return (
      <Swipeable
        ref={assignRefs(myRef, ref)}
        friction={2}
        enableTrackpadTwoFingerGesture
        enabled={enabled}
        leftThreshold={30}
        rightThreshold={40}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableClose={onSwipeableClose}
        onSwipeableOpen={onSwipeableOpen}
        onSwipeableWillClose={onSwipeableWillClose}
        onSwipeableWillOpen={onSwipeableWillOpen}
        containerStyle={[
          position?.includes('first') ? s.containerFirst : {},
          position?.includes('last') ? s.containerLast : {}
        ]}>
        {children}        
      </Swipeable>
    );
  },
);

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  containerFirst: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderTopStartRadius: 10,
    borderTopEndRadius: 10,
  },
  containerLast: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
  },
  leftAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftActionFirst: {
    borderTopLeftRadius: 10,
    borderTopStartRadius: 10,
  },
  leftActionLast: {
    borderBottomLeftRadius: 10,
    borderBottomStartRadius: 10,
  },
  actionText: {
    ...theme.styles.textTiny,
    color: theme.colors.stickyWhite,
    backgroundColor: theme.colors.transparent,
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActionFirst: {
    borderTopRightRadius: 10,
    borderTopEndRadius: 10,
  },
  rightActionLast: {
    borderBottomRightRadius: 10,
    borderBottomEndRadius: 10,
  },
}));

export { AppleStyleSwipeableRow };
