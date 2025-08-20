import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  ListItem,
  ListItemSwitch,
  SwipeButton,
  ThemeManager,
  WheelPicker,
  WheelPickerItem,
  getColoredSvg,
  listItemPosition,
  useDevice,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import {
  batteryPerformanceWithModel,
  fuelCapacityPerformanceWithModel,
} from 'lib/analytics';
import { secondsToFormat } from 'lib/formatters';
import { modelHasChecklists, modelTypeIconProps } from 'lib/model';
import { eventKind } from 'lib/modelEvent';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useTimer } from 'lib/useTimer';
import {
  BatteryFull,
  BatteryLow,
  CircleCheck,
  CirclePause,
  CirclePlay,
  CircleStop,
  Fuel,
  TriangleAlert,
} from 'lucide-react-native';
import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { Model } from 'realmdb/Model';
import { selectEventPreferences } from 'store/selectors/appSettingsSelectors';
import { selectEventSequence } from 'store/selectors/eventSequence';
import { eventSequence } from 'store/slices/eventSequence';
import { ChecklistType } from 'types/checklist';
import { EventSequenceNavigatorParamList } from 'types/navigation';
import { TimerMode, TimerState } from 'types/timer';

type TimerButton = {
  icon: ReactElement;
  onPress?: () => void | undefined;
};

export type Props = NativeStackScreenProps<
  EventSequenceNavigatorParamList,
  'EventSequenceTimer'
>;

const EventSequenceTimerScreen = ({ navigation, route }: Props) => {
  const { cancelable } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();
  const confirmAction = useConfirmAction();
  const event = useEvent();
  const dispatch = useDispatch();
  const realm = useRealm();

  const eventPreferences = useSelector(selectEventPreferences);
  const currentEventSequence = useSelector(selectEventSequence);
  const model = useObject(
    Model,
    new BSON.ObjectId(currentEventSequence.modelId),
  );
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [kind] = useState(eventKind(model?.type));

  // const timerUsesButtons = false;
  const [countdownTimerEnabled, setCountdownTimerEnabled] = useState(false);
  const countdownValue = useRef(0);

  const timerMessageAnim = useSharedValue(1);
  const duration = 850;
  const easing = Easing.linear;
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: timerMessageAnim.value,
    transform: [{ scale: timerMessageAnim.value / 5 + 1 }],
  }));

  const timer = useTimer(tick, {
    initialValue: 0,
    isCountdown: false,
    allowOvertime: true,
    alerts: undefined,
  });

  function tick(state: TimerState) {
    if (state.mode === TimerMode.Stopped) {
      stopEvent(state);
    }
  }

  useEffect(() => {
    navigation.setOptions({
      headerBackVisible: timer.state.mode === TimerMode.Initial,
      headerLeft: () => {
        if (cancelable && timer.state.mode === TimerMode.Initial) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={{
                ...theme.styles.buttonScreenHeaderTitle,
                ...s.buttonScreenHeaderTitleLeft,
              }}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={() =>
                confirmAction(
                  {
                    label: `Do Not Log ${kind.name}`,
                    title: `This action cannot be undone.\nAre you sure you don't want to log this ${kind.name}?`,
                  },
                  cancelEvent,
                )
              }
            />
          );
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.state.mode]);

  useEffect(() => {
    // Get all the batteries for this event.
    const eventBatteries: Battery[] = [];
    currentEventSequence.batteryIds.forEach(id => {
      const b = realm.objectForPrimaryKey(
        Battery,
        new BSON.ObjectId(new BSON.ObjectId(id)),
      );
      b && eventBatteries.push(b);
    });
    setBatteries(eventBatteries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    timerMessageAnim.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0.1, { duration, easing }),
          withTiming(1, { duration, easing }),
        ),
        -1,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    event.on('deviceShake', onDeviceShake);
    return () => {
      event.removeListener('deviceShake', onDeviceShake);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const cancelEvent = () => {
    dispatch(eventSequence.reset());
    navigation.goBack();
  };

  const stopEvent = (state: TimerState) => {
    // Calculate the total time the timer has been runnng.
    let duration = state.value;
    if (state.isCountdown) {
      if (state.inOvertime) {
        duration = state.initialValue + state.value;
      } else {
        duration = state.initialValue - state.value;
      }
    }
    // Set the number of seconds.
    dispatch(
      eventSequence.setDuration({ duration: Math.trunc(duration / 1000) }),
    );

    if (model && modelHasChecklists(model, ChecklistType.PostEvent)) {
      navigation.push('EventSequenceChecklist', {
        cancelable: true,
        checklistType: ChecklistType.PostEvent,
      });
    } else {
      navigation.navigate('EventSequenceNewEventEditor');
    }
  };

  // For testing swipe/shake for timer.
  useEffect(() => {
    if (__DEV__ && !eventPreferences.timerUsesButtons) {
      if (timer.state.mode === TimerMode.Armed) {
        setTimeout(() => {
          event.emit('deviceShake');
        }, 10000);
      }

      if (timer.state.mode === TimerMode.Running) {
        setTimeout(() => {
          timer.pause();
        }, 10000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, eventPreferences.timerUsesButtons]);

  const onDeviceShake = () => {
    if (timer.state.mode === TimerMode.Armed) {
      timer.start();
    } else if (timer.state.mode === TimerMode.Running) {
      timer.pause();
    }
  };

  const toggleCountdownTimer = (value: boolean) => {
    setCountdownTimerEnabled(value);
    // Preserves any prior set countdown value for better ux.
    timer.setCountdown(value ? countdownValue.current : 0);
  };

  const onCountdownValueChange = (value: string[]) => {
    const min = value[0] ? parseInt(value[0], 10) : 0;
    const sec = value[1] ? parseInt(value[1], 10) : 0;
    const ms = (min * 60 + sec) * 1000;
    timer.setCountdown(ms);
    countdownValue.current = ms;
  };

  const millisecondsToPickerMSS = (ms: number) => {
    const secs = ms / 1000;
    const nearest5 = Math.ceil(secs / 5) * 5;
    const mss = secondsToFormat(nearest5);
    const str = mss.split(':');
    return [`${+str[0]}`, `${+str[1]}`];
  };

  const onSwipeTimer = (isOn: boolean) => {
    isOn ? timer.arm() : timer.disarm();

    if (
      !eventPreferences.timerUsesButtons &&
      !isOn &&
      timer.state.tickCount > 0
    ) {
      timer.stop();
    }
  };

  const renderTimerButtons = (): ReactNode => {
    let leftButton: TimerButton;
    let rightButton: TimerButton;

    if (timer.state.mode === TimerMode.Initial) {
      leftButton = {
        icon: <CircleCheck color={theme.colors.assertive} size={60} />,
        onPress: timer.arm,
      };
      rightButton = {
        icon: (
          <CirclePlay
            color={theme.colors.stickyWhite}
            size={60}
            style={s.timerButtonDisabled}
          />
        ),
      };
    } else if (timer.state.mode === TimerMode.Armed) {
      leftButton = {
        icon: <CircleStop color={theme.colors.success} size={60} />,
        onPress: timer.disarm,
      };
      rightButton = {
        icon: <CirclePlay color={theme.colors.stickyWhite} size={60} />,
        onPress: timer.start,
      };
    } else if (timer.state.mode === TimerMode.Running) {
      leftButton = {
        icon: (
          <CircleStop
            color={theme.colors.success}
            size={60}
            style={s.timerButtonDisabled}
          />
        ),
      };
      rightButton = {
        icon: <CirclePause color={theme.colors.stickyWhite} size={60} />,
        onPress: timer.pause,
      };
    } else if (timer.state.mode === TimerMode.Paused) {
      leftButton = {
        icon: <CircleStop color={theme.colors.success} size={60} />,
        onPress: timer.stop,
      };
      rightButton = {
        icon: <CirclePlay color={theme.colors.stickyWhite} size={60} />,
        onPress: timer.start,
      };
    } else if (timer.state.mode === TimerMode.Expired) {
      leftButton = {
        icon: (
          <CircleStop
            color={theme.colors.success}
            size={60}
            style={s.timerButtonDisabled}
          />
        ),
      };
      rightButton = {
        icon: <CirclePause color={theme.colors.stickyWhite} size={60} />,
        onPress: timer.pause,
      };
    } else {
      // Stopped
      leftButton = {
        icon: (
          <CircleStop
            color={theme.colors.success}
            size={60}
            style={s.timerButtonDisabled}
          />
        ),
      };
      rightButton = {
        icon: (
          <CirclePlay
            color={theme.colors.stickyWhite}
            size={60}
            style={s.timerButtonDisabled}
          />
        ),
      };
    }

    return (
      <View style={s.timerButtons}>
        <Pressable onPress={leftButton.onPress}>{leftButton.icon}</Pressable>
        <Pressable onPress={rightButton.onPress}>{rightButton.icon}</Pressable>
      </View>
    );
  };

  const renderTimerSwipe = () => {
    return (
      <View style={s.timerSwipeable}>
        <SwipeButton
          trackColor={
            timer.state.mode === TimerMode.Running
              ? theme.colors.blackTransparentSubtle
              : theme.colors.assertive
          }
          text={'Slide to arm'}
          textStyle={s.swipeText}
          backText={
            timer.state.mode === TimerMode.Running
              ? `${kind.name} in progress`
              : !timer.state.tickCount
                ? 'Slide to disarm'
                : `Slide to end ${kind.name}`
          }
          backTextStyle={s.swipeText}
          padding={7}
          height={60}
          width={device.screen.width - 45}
          trackStartColor={
            timer.state.mode === TimerMode.Running
              ? theme.colors.blackTransparentSubtle
              : theme.colors.success
          }
          trackEndColor={
            timer.state.mode === TimerMode.Running
              ? theme.colors.blackTransparentSubtle
              : theme.colors.success
          }
          thumbStyle={
            timer.state.mode === TimerMode.Running
              ? s.swipeThumbTimerRunning
              : {}
          }
          onToggle={onSwipeTimer}
        />
      </View>
    );
  };

  const countdownTimerItems = useMemo((): WheelPickerItem[][] => {
    const minutes: WheelPickerItem[] = [];
    const seconds: WheelPickerItem[] = [];

    for (let i = 0; i < 91; i++) {
      minutes[i] = {
        label: `${i} minute${i !== 1 ? 's' : ''}`,
        value: `${i}`,
        color: theme.colors.stickyWhite,
      };
    }
    for (let i = 0; i < 12; i++) {
      seconds[i] = {
        label: `${i * 5} seconds`,
        value: `${i * 5}`,
        color: theme.colors.stickyWhite,
      };
    }

    return [minutes, seconds];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderModel = () => {
    if (!model) return null;
    return (
      <>
        <View style={s.modelContainer}>
          {model.image ? (
            <Image
              source={{ uri: model.image }}
              resizeMode={'cover'}
              style={s.modelImage}
            />
          ) : (
            <SvgXml
              xml={getColoredSvg(modelTypeIconProps[model.type]?.name)}
              width={100}
              height={110}
              color={theme.colors.brandSecondary}
              style={s.modelIcon}
            />
          )}
        </View>
        <Text style={s.modelName}>{model.name}</Text>
        <Text style={s.eventKind}>
          {`${eventKind(model.type).name} #${model.events.length + 1}`}
        </Text>
      </>
    );
  };

  const batteryPerformance = () => {
    const stats = model && batteryPerformanceWithModel(model, batteries);
    return stats?.map(s => {
      return {
        style: s.style,
        count: `x${s.count}`,
        time: `${secondsToFormat(s.seconds, { format: "m'm' s's'" })} (80%)`,
      };
    });
  };

  const fuelCapacityPerformance = () => {
    const stats = model && fuelCapacityPerformanceWithModel(model);
    return stats?.map(s => {
      return {
        style: s.style,
        count: `x${s.count}`,
        time: `${secondsToFormat(s.seconds, { format: "m'm' s's'" })} (80%)`,
      };
    });
  };

  const renderBattery: ListRenderItem<Battery> = ({ item: battery, index }) => {
    const performance = batteryPerformance();
    const isCharged =
      battery?.cycles[battery.cycles.length - 1]?.charge ||
      !battery?.cycles.length;
    let position = listItemPosition(index, batteries.length);
    position = model?.logsFuel ? position.filter(e => e !== 'first') : position;
    return (
      <ListItem
        key={`${index}`}
        title={battery.name}
        subtitle={
          performance?.length ? (
            <View style={s.performanceContainer}>
              {performance.map((item, index) => {
                return (
                  <View key={index} style={s.performanceRow}>
                    <Text style={s.performanceItem}>{item.style}</Text>
                    <Text style={[s.performanceItem, s.performanceRowMid]}>
                      {item.count}
                    </Text>
                    <Text style={s.performanceItem}>{item.time}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={s.performanceContainer}>
              <View style={s.performanceRow}>
                <Text style={s.performanceItem}>
                  {'No recent flights with this model'}
                </Text>
              </View>
            </View>
          )
        }
        containerStyle={s.listItemContainer}
        bottomDividerColor={theme.colors.whiteTransparentLight}
        titleStyle={s.listItemTitle}
        position={position}
        leftContent={
          isCharged ? (
            <BatteryFull
              color={theme.colors.brandSecondary}
              style={s.batteryIcon}
            />
          ) : (
            <BatteryLow
              color={theme.colors.brandSecondary}
              style={s.batteryIcon}
            />
          )
        }
      />
    );
  };

  const renderNoBatteries = () => {
    return (
      <ListItem
        title={'Battery Logging'}
        subtitle={'No batteries were selected'}
        position={model?.logsFuel ? ['last'] : ['first', 'last']}
        containerStyle={s.listItemContainer}
        titleStyle={s.listItemTitle}
        leftContent={<TriangleAlert color={theme.colors.warning} />}
      />
    );
  };

  const renderFuelConsumption = () => {
    const performance = fuelCapacityPerformance();
    return (
      <ListItem
        title={'Fuel Consumption Averages'}
        subtitle={
          performance?.length ? (
            <View style={s.performanceContainer}>
              {performance.map((item, index) => {
                return (
                  <View key={index} style={s.performanceRow}>
                    <Text style={s.performanceItem}>{item.style}</Text>
                    <Text style={[s.performanceItem, s.performanceRowMid]}>
                      {item.count}
                    </Text>
                    <Text style={s.performanceItem}>{item.time}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={s.performanceContainer}>
              <View style={s.performanceRow}>
                <Text style={s.performanceItem}>
                  {'No recent flights with this model'}
                </Text>
              </View>
            </View>
          )
        }
        containerStyle={s.listItemContainer}
        titleStyle={s.listItemTitle}
        position={model?.logsBatteries ? ['first'] : ['first', 'last']}
        leftContent={<Fuel color={theme.colors.brandSecondary} />}
      />
    );
  };

  if (!model) {
    return <EmptyView error message={'Model Not Found!'} />;
  }

  return (
    <View style={s.view}>
      <View style={s.upper}>
        {(!countdownTimerEnabled ||
          (countdownTimerEnabled &&
            timer.state.mode !== TimerMode.Initial)) && (
          <Animated.Text
            entering={FadeIn}
            exiting={FadeOut}
            style={[
              s.timerValue,
              timer.state.mode === TimerMode.Armed ? s.timerValueArmed : {},
              timer.state.inOvertime ? s.timerOvertime : {},
            ]}>
            {secondsToFormat(Math.abs(Math.trunc(timer.state.value / 1000)), {
              format: 'm:ss',
            })}
          </Animated.Text>
        )}
        {timer.state.mode === TimerMode.Armed && (
          <Animated.View style={[s.timerMessageContainer, animatedStyle]}>
            <Text style={s.timerMessage}>
              {eventPreferences.timerUsesButtons
                ? 'Tap to Start Timer...'
                : 'Shake to Start Timer...'}
            </Text>
          </Animated.View>
        )}
        {countdownTimerEnabled && timer.state.mode === TimerMode.Initial && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <WheelPicker
              placeholder={'none'}
              wheelVisible={[true, true]}
              itemWidth={['45%', '45%']}
              items={countdownTimerItems}
              value={millisecondsToPickerMSS(countdownValue.current)}
              onValueChange={(_wheelIndex, value) =>
                onCountdownValueChange(value as string[])
              }
            />
          </Animated.View>
        )}
        <View style={s.timerType}>
          <ListItemSwitch
            title={'Countdown Timer'}
            value={countdownTimerEnabled}
            position={['first', 'last']}
            containerStyle={s.listItemContainer}
            titleStyle={s.listItemTitle}
            disabled={timer.state.mode !== TimerMode.Initial}
            onValueChange={toggleCountdownTimer}
          />
        </View>
      </View>
      <View style={s.lower}>
        <ScrollView style={s.summary} showsVerticalScrollIndicator={false}>
          {renderModel()}
          {model.logsFuel && <>{renderFuelConsumption()}</>}
          {model.logsBatteries && (
            <FlatList
              data={batteries}
              renderItem={renderBattery}
              keyExtractor={(_item, index) => `${index}`}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              ListFooterComponent={<Divider />}
              ListEmptyComponent={renderNoBatteries()}
            />
          )}
        </ScrollView>
      </View>
      {eventPreferences.timerUsesButtons
        ? renderTimerButtons()
        : renderTimerSwipe()}
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme, device }) => ({
  batteryIcon: {
    transform: [{ rotate: '-90deg' }],
  },
  buttonScreenHeaderTitleLeft: {
    color: theme.colors.stickyWhite,
  },
  eventKind: {
    ...theme.text.small,
    color: theme.colors.whiteTransparentLight,
    textAlign: 'center',
    marginBottom: 10,
  },
  fuelIcon: {
    width: '100%',
    left: -2,
  },
  listItemContainer: {
    backgroundColor: theme.colors.whiteTransparentSubtle,
  },
  listItemTitle: {
    color: theme.colors.stickyWhite,
  },
  lower: {
    height: '42%',
    bottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.whiteTransparentSubtle,
  },
  modelContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 15,
    marginBottom: 10,
    height: 100,
    borderWidth: 0,
  },
  modelImage: {
    width: '100%',
    height: '100%',
  },
  modelIcon: {
    transform: [{ rotate: '-45deg' }],
    alignSelf: 'center',
  },
  modelName: {
    ...theme.text.normal,
    color: theme.colors.stickyWhite,
    textAlign: 'center',
    marginBottom: 3,
  },
  performanceContainer: {
    paddingTop: 5,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  performanceItem: {
    ...theme.text.small,
    color: theme.colors.whiteTransparentLight,
  },
  performanceRowMid: {
    position: 'absolute',
    right: 95,
  },
  upper: {
    height: '42%',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.whiteTransparentSubtle,
  },
  summary: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  swipeText: {
    ...theme.text.xl,
    color: theme.colors.stickyWhite,
  },
  swipeThumbTimerRunning: {
    opacity: 0,
    pointerEvents: 'none',
  },
  timerValue: {
    textAlign: 'center',
    ...theme.text.normal,
    color: theme.colors.stickyWhite,
    fontSize: 92,
    lineHeight: 92,
  },
  timerValueArmed: {
    opacity: 0.1,
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
  timerMessage: {
    ...theme.text.large,
    color: theme.colors.stickyWhite,
    marginTop: -15,
  },
  timerOvertime: {
    backgroundColor: theme.colors.assertive,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.whiteTransparentLight,
  },
  timerButtons: {
    position: 'absolute',
    bottom: device.insets.bottom,
    width: device.screen.width,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timerButtonDisabled: {
    opacity: 0.6,
  },
  timerSwipeable: {
    position: 'absolute',
    bottom: device.insets.bottom,
    width: device.screen.width,
    alignItems: 'center',
  },
  view: {
    ...theme.styles.view,
    backgroundColor: theme.colors.brandPrimary,
  },
}));

export default EventSequenceTimerScreen;
