import Animated, { Easing, FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemSwitch } from 'components/atoms/List';
import { Picker, PickerItem, SwipeButton, viewport } from '@react-native-ajp-elements/ui';
import { Pressable, Text, View } from 'react-native';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import { EventSequenceNavigatorParamList } from 'types/navigation';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

enum TimerState {
  Initial,
  Armed,
  Running,
  Paused,
  Stopped,
};

type TimerButton = {
  icon: string;
  color: string;
  onPress?: () => void | undefined;
};

export type Props = NativeStackScreenProps<EventSequenceNavigatorParamList, 'EventSequenceTimer'>;

const EventSequenceTimerScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const event = useEvent();
  
  const timerUsesButtons = true;

  const [countdownTimerEnabled, setCountdownTimerEnabled] = useState(false);
  const [timerState, setTimerState] = useState(TimerState.Initial);

  const timerMessageAnim = useSharedValue(1);
  const duration = 850;
  const easing = Easing.linear;
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: timerMessageAnim.value,
    transform: [{ scale: timerMessageAnim.value / 5 + 1 }],
  }));

  useEffect(() => {
    timerMessageAnim.value =
      withDelay(500,
        withRepeat(
          withSequence(
            withTiming(0.1, { duration, easing }),
            withTiming(1, { duration, easing }),
          ),
        -1
        )
      );
  }, []);

  useEffect(() => {
    event.on('deviceShake', () => console.log('SHAKE'));
  }, []);

  const toggleCountdownTimer = (value: boolean) => {
    setCountdownTimerEnabled(value);
  };

  const onSwipeArmTimer = (isToggled: boolean) => {
    isToggled ? armTimer() : disarmTimer();
  };

  const armTimer = () => {
    setTimerState(TimerState.Armed);
  };

  const disarmTimer = () => {
    setTimerState(TimerState.Initial);
  };

  const startTimer = () => {
    setTimerState(TimerState.Running);
  };

  const pauseTimer = () => {
    setTimerState(TimerState.Paused);
  };

  const stopTimer = () => {
    setTimerState(TimerState.Stopped);
  };

  const renderTimerButtons = (): ReactNode => {
    let leftButton: TimerButton = { icon: 'circle-check', color: theme.colors.assertive, onPress: armTimer };
    let rightButton: TimerButton = { icon: 'circle-play', color: theme.colors.stickyWhite, onPress: undefined };

    if (timerState === TimerState.Armed)  {
      leftButton = { icon: 'circle-stop', color: theme.colors.success, onPress: disarmTimer };
      rightButton = { icon: 'circle-play', color: theme.colors.stickyWhite, onPress: startTimer };
    } else if (timerState === TimerState.Running)  {
      leftButton = { icon: 'circle-stop', color: theme.colors.stickyWhite, onPress: undefined };
      rightButton = { icon: 'circle-pause', color: theme.colors.stickyWhite, onPress: pauseTimer };
    } else if (timerState === TimerState.Paused)  {
      leftButton = { icon: 'circle-stop', color: theme.colors.success, onPress: stopTimer };
      rightButton = { icon: 'circle-play', color: theme.colors.stickyWhite, onPress: startTimer };
    } else if (timerState === TimerState.Stopped)  {
      leftButton = { icon: 'circle-check', color: theme.colors.assertive, onPress: undefined };
      rightButton = { icon: 'circle-play', color: theme.colors.stickyWhite, onPress: undefined };
    }

    return (
      <>
      <Pressable onPress={leftButton.onPress}>
        <Icon
          name={leftButton.icon}
          size={52}
          color={leftButton.color}
          style={leftButton.onPress ? {opacity: 1} : {opacity: 0.3}}
        />
        </Pressable>
        <Pressable onPress={rightButton.onPress}>
          <Icon
            name={rightButton.icon}
            size={52}
            color={rightButton.color}
            style={rightButton.onPress ? {opacity: 1} : {opacity: 0.3}}
          />
        </Pressable>
      </>
    );
  };

  const countdownTimerItems = useMemo((): PickerItem[][] => {
    const minutes: PickerItem[] = [];
    const seconds: PickerItem[] = [];

    for(let i = 0; i < 91; i++) {
      minutes[i] = {
        label: `${i} minute${i !== 1 ? 's' : ''}`,
        value: `${i}`,
        color: theme.colors.stickyWhite
      };
    }
    for(let i = 0; i < 12; i++) {
      seconds[i] = {
        label: `${i * 5} seconds`,
        value: `${i * 5}`,
        color: theme.colors.stickyWhite
      };
    }

    return [minutes, seconds];
  }, []);

  return (
    <View style={s.view}>
      <View style={s.upper}>
        {(!countdownTimerEnabled || (countdownTimerEnabled && timerState !== TimerState.Initial)) && 
          <Animated.Text entering={FadeIn} exiting={FadeOut} style={[s.timerValue, timerState === TimerState.Armed ? s.timerValueArmed : {}]}>
            {'0:00'}
          </Animated.Text>
        }
        {timerState === TimerState.Armed &&
          <Animated.View style={[s.timerMessageContainer, animatedStyle]}>
            <Text style={s.timerMessage}>
              {timerUsesButtons ? 'Tap to Start Timer...' : 'Shake to Start Timer...'}
            </Text>
          </Animated.View>
        }
        {(countdownTimerEnabled && timerState === TimerState.Initial) &&
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Picker
              placeholder={'none'}
              itemWidth={[viewport.width / 2 - 5.5, viewport.width / 2 - 5.5]}
              items={countdownTimerItems}
              onValueChange={() => null} />
          </Animated.View>
        }
        <View style={s.timerType}>
          <ListItemSwitch
            title={'Countdown Timer'}
            value={countdownTimerEnabled}
            position={['first', 'last']}
            containerStyle={s.listItemContainer}
            titleStyle={s.listItemTitle}
            onValueChange={toggleCountdownTimer}
          />
        </View>
      </View>
      <View style={s.lower}>
        <View style={s.summary}>
          <ListItem
            title={'Goblin Buddy'}
            subtitle={'#2'}
            position={['first']}
            containerStyle={s.listItemContainer}
            titleStyle={s.listItemTitle}
            rightImage={false}
          />
          <ListItem
            title={'Fuel Consumption Averages'}
            subtitle={'No recent flights with this model'}
            containerStyle={s.listItemContainer}
            titleStyle={s.listItemTitle}
            rightImage={false}
          />
          <ListItem
            title={'Battery Logging'}
            subtitle={'No batteries were selected'}
            position={['last']}
            containerStyle={s.listItemContainer}
            titleStyle={s.listItemTitle}
            rightImage={false}
          />
        </View>
      </View>
      {timerUsesButtons ?
        <View style={s.timerButtons}>
          {renderTimerButtons()}
        </View>
        :
        <View style={s.timerSwipeable}>
          <SwipeButton
            trackColor={timerState === TimerState.Running ? theme.colors.blackTransparentSubtle : theme.colors.assertive}
            text={'Slide to arm'}
            textStyle={s.swipeText}
            backText={timerState === TimerState.Running ? 'Timer running' : 'Slide to disarm'}
            backTextStyle={s.swipeText}
            padding={7}
            height={60}
            width={viewport.width - 45}
            trackStartColor={timerState === TimerState.Running ? theme.colors.blackTransparentSubtle : theme.colors.success}
            trackEndColor={timerState === TimerState.Running ? theme.colors.blackTransparentSubtle : theme.colors.success}
            thumbStyle={timerState === TimerState.Running ? s.swipeThumbTimerRunning : {}}
            onToggle={onSwipeArmTimer} />
        </View>
      }
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  view: {
    ...theme.styles.view,
    backgroundColor: theme.colors.brandPrimary
  },
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  listItemContainer: {
    backgroundColor: theme.colors.whiteTransparentSubtle,
  },
  listItemTitle: {
    color: theme.colors.stickyWhite,
  },
  upper: {
    height: '42%',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.whiteTransparentSubtle,
  },
  timerValue: {
    textAlign: 'center',
    ...theme.styles.textNormal,
    color: theme.colors.stickyWhite,
    fontSize: 92,
    letterSpacing: -5,
  },
  timerValueArmed: {
    opacity: 0.1
  },
  timerType: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
  },
  timerMessageContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
  },
  timerMessage:  {
    ...theme.styles.textLarge,
    color: theme.colors.stickyWhite,
  },
  lower: {
    height: '42%',
    bottom: 0,
    top: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.whiteTransparentSubtle,
  },
  summary: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  timerButtons: {
    position: 'absolute',
    bottom: theme.insets.bottom,
    width: viewport.width,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timerSwipeable: {
    position: 'absolute',
    bottom: theme.insets.bottom,
    width: viewport.width,
    alignItems: 'center',
  },
  swipeText: {
    ...theme.styles.textXL,
    color: theme.colors.stickyWhite,
  },
  swipeThumbTimerRunning: {
    opacity: 0,
    pointerEvents: 'none',
  }
}));

export default EventSequenceTimerScreen;
