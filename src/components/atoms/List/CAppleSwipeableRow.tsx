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
    ) => {
      const trans = progress.interpolate({
        inputRange: [0, 50, 100, 101],
        outputRange: [-20, 0, 0, 1],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          key={item.text}
          style={{ flex: 1, transform: [{ translateX: trans }] }}>
          <Pressable
            style={[s.leftAction, { backgroundColor: item.color }]}
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
            flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
          }}>
          {leftItems.map(item => {
            return renderLeftAction(item, progress);
          })}
        </View>
      );
    };

    const renderRightAction = (
      item: SwipeableItem,
      progress: Animated.AnimatedInterpolation<number>,
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
            style={[s.rightAction, { backgroundColor: item.color }]}
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
          {rightItems.map(item => {
            return renderRightAction(item, progress);
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
        onSwipeableWillOpen={onSwipeableWillOpen}>
        {children}
      </Swipeable>
    );
  },
);

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  leftAction: {
    flex: 1,
    justifyContent: 'center',
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
}));

export { AppleStyleSwipeableRow };
