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
import TimerFace from 'components/atoms/TimerFace';
import { EmptyView } from 'components/molecules/EmptyView';
import {
  batteryPerformanceWithModel,
  fuelCapacityPerformanceWithModel,
} from 'lib/analytics';
import { secondsToFormat } from 'lib/formatters';
import { modelHasChecklists, modelTypeIconProps } from 'lib/model';
import { eventKind } from 'lib/modelEvent';
import { useDeviceShake } from 'lib/useDeviceShake';
import { useTimer } from 'lib/useTimer';
import {
  Battery as BatteryEmpty,
  BatteryFull,
  BatteryLow,
  ChevronsLeft,
  ChevronsRight,
  CircleGauge,
  CirclePause,
  CirclePlay,
  CircleStop,
  ClockArrowDown,
  ClockArrowUp,
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
  const event = useEvent();
  const dispatch = useDispatch();
  const realm = useRealm();

  const { enable: enableVibration, disable: disableVibration } =
    useDeviceShake();

  const eventPreferences = useSelector(selectEventPreferences);
  const currentEventSequence = useSelector(selectEventSequence);
  const model = useObject(
    Model,
    new BSON.ObjectId(currentEventSequence.modelId),
  );
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [kind] = useState(eventKind(model?.type));

  const [countdownTimerEnabled, setCountdownTimerEnabled] = useState(false);
  const countdownValue = useRef(0);

  const timerMessageAnim = useSharedValue(1);
  const duration = 850;
  const easing = Easing.linear;

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
              onPress={cancelEvent}
            />
          );
        }
      },
      headerRight: () => {
        if (timer.state.mode === TimerMode.Initial) {
          return (
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              icon={
                countdownTimerEnabled ? (
                  <ClockArrowDown color={theme.colors.stickyWhite} size={28} />
                ) : (
                  <ClockArrowUp color={theme.colors.stickyWhite} size={28} />
                )
              }
              onPress={() => toggleCountdownTimer()}
            />
          );
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdownTimerEnabled, timer.state.mode]);

  useEffect(() => {
    if (eventPreferences.timerUsesButtons) return;

    switch (timer.state.mode) {
      case TimerMode.Armed:
      case TimerMode.Paused:
      case TimerMode.Running:
        enableVibration();
        break;
      default:
        disableVibration();
    }
  }, [
    disableVibration,
    enableVibration,
    eventPreferences.timerUsesButtons,
    timer.state.mode,
  ]);

  useEffect(() => {
    // Get all the batteries for this event.
    const eventBatteries: Battery[] = [];
    currentEventSequence.batteryIds.forEach(id => {
      const b = realm.objectForPrimaryKey(
        Battery,
        new BSON.ObjectId(new BSON.ObjectId(id)),
      );
      if (b) eventBatteries.push(b);
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
    event.on('device-shake', onDeviceShake);
    return () => {
      event.removeListener('device-shake', onDeviceShake);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const cancelEvent = () => {
    dispatch(eventSequence.reset());
    navigation.goBack();
  };

  const stopEvent = (state: TimerState) => {
    // Set the number of seconds.
    dispatch(
      eventSequence.setDuration({ duration: Math.trunc(state.elapsed / 1000) }),
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

  const onDeviceShake = () => {
    if (timer.state.mode === TimerMode.Armed) {
      timer.start();
    } else if (timer.state.mode === TimerMode.Running) {
      timer.pause();
    } else if (timer.state.mode === TimerMode.Paused) {
      timer.resume();
    }
  };

  const toggleCountdownTimer = () => {
    setCountdownTimerEnabled(!countdownTimerEnabled);
    // Preserves any prior set countdown value for better ux.
    timer.setCountdown(!countdownTimerEnabled ? countdownValue.current : 0);
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
    if (isOn) {
      timer.arm();
    } else {
      timer.disarm();
    }

    if (
      !eventPreferences.timerUsesButtons &&
      !isOn &&
      timer.state.tickCount > 0
    ) {
      timer.stop();
    }
  };

  const renderTimerButtons = (): ReactNode => {
    // Timer initial state
    let leftButton: TimerButton = {
      icon: (
        <CircleGauge
          color={theme.colors.stickyWhite}
          size={60}
          style={{ transform: [{ rotateY: '180deg' }] }}
        />
      ),
      onPress: timer.arm,
    };
    let middleButton: TimerButton = {
      icon: (
        <CirclePlay
          color={theme.colors.stickyWhite}
          size={100}
          style={s.timerButtonDisabled}
        />
      ),
    };
    let rightButton: TimerButton = {
      icon: (
        <CircleStop
          color={theme.colors.stickyWhite}
          size={60}
          style={s.timerButtonDisabled}
        />
      ),
    };

    if (timer.state.mode === TimerMode.Armed) {
      leftButton = {
        icon: <CircleGauge color={theme.colors.success} size={60} />,
        onPress: timer.disarm,
      };
      middleButton = {
        icon: <CirclePlay color={theme.colors.stickyWhite} size={100} />,
        onPress: timer.start,
      };
    } else if (timer.state.mode === TimerMode.Running) {
      leftButton = {
        icon: (
          <CircleGauge
            color={theme.colors.success}
            size={60}
            style={s.timerButtonDisabled}
          />
        ),
      };
      middleButton = {
        icon: <CirclePause color={theme.colors.stickyWhite} size={100} />,
        onPress: timer.pause,
      };
    } else if (timer.state.mode === TimerMode.Paused) {
      leftButton = {
        icon: (
          <CircleGauge
            color={theme.colors.success}
            size={60}
            style={s.timerButtonDisabled}
          />
        ),
      };
      middleButton = {
        icon: <CirclePlay color={theme.colors.stickyWhite} size={100} />,
        onPress: timer.start,
      };
      rightButton = {
        icon: <CircleStop color={theme.colors.stickyWhite} size={60} />,
        onPress: timer.stop,
      };
    } else if (timer.state.mode === TimerMode.Expired) {
      leftButton = {
        icon: (
          <CircleGauge
            color={theme.colors.success}
            size={60}
            style={s.timerButtonDisabled}
          />
        ),
      };
      middleButton = {
        icon: <CirclePause color={theme.colors.stickyWhite} size={100} />,
        onPress: timer.pause,
      };
    }

    return (
      <View style={s.timerButtons}>
        <Pressable onPress={leftButton.onPress}>{leftButton.icon}</Pressable>
        <Pressable onPress={middleButton.onPress}>
          {middleButton.icon}
        </Pressable>
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
          thumbComponent={
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {timer.state.mode === TimerMode.Initial ? (
                <ChevronsRight color={theme.colors.assertive} size={33} />
              ) : (
                <ChevronsLeft color={theme.colors.success} size={33} />
              )}
            </View>
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
        label: `${i}`.padStart(2, '0'),
        value: `${i}`,
      };
    }
    for (let i = 0; i < 12; i++) {
      seconds[i] = {
        label: `${i * 5}`.padStart(2, '0'),
        value: `${i * 5}`,
      };
    }

    return [minutes, seconds];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderModel = () => {
    if (!model) return null;
    return (
      <ListItem
        title={model.name}
        titleStyle={{
          ...theme.text.xl,
          color: theme.colors.stickyWhite,
          fontWeight: '700',
          marginLeft: -10,
        }}
        value={`${eventKind(model.type).name} #${model.events.length + 1}`}
        valueStyle={{ ...theme.text.small, color: theme.colors.stickyWhite }}
        containerStyle={{
          backgroundColor: theme.colors.transparent,
        }}
        bottomDividerColor={theme.colors.brandSecondary}
        bottomDividerLeft={-10}
        rightContentStyle={{
          width: 60,
          alignItems: 'flex-end',
        }}
        rightContent={
          <SvgXml
            xml={getColoredSvg(modelTypeIconProps[model.type]?.name)}
            width={60}
            height={60}
            color={theme.colors.brandSecondary}
            style={s.modelIcon}
          />
        }
      />
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
        titleStyle={{
          ...theme.text.xl,
          color: theme.colors.stickyWhite,
          fontWeight: '700',
          marginLeft: -10,
        }}
        subtitleStyle={{
          marginLeft: -10,
        }}
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
                  {`No logged ${kind.namePlural} with this model`}
                </Text>
              </View>
            </View>
          )
        }
        containerStyle={{
          backgroundColor: theme.colors.transparent,
        }}
        bottomDividerColor={theme.colors.brandSecondary}
        bottomDividerLeft={-10}
        position={position}
        rightContentStyle={{
          width: 60,
          alignItems: 'flex-end',
        }}
        rightContent={
          isCharged ? (
            <BatteryFull
              color={theme.colors.brandSecondary}
              style={s.batteryIcon}
              size={32}
            />
          ) : (
            <BatteryLow
              color={theme.colors.brandSecondary}
              style={s.batteryIcon}
              size={32}
            />
          )
        }
      />
    );
  };

  const renderNoBatteries = () => {
    return (
      <ListItem
        title={'No batteries selected'}
        titleStyle={{
          ...theme.text.xl,
          color: theme.colors.warning,
        }}
        containerStyle={{
          backgroundColor: theme.colors.transparent,
        }}
        bottomDividerColor={theme.colors.brandSecondary}
        bottomDividerLeft={-10}
        leftContentStyle={{ marginLeft: -15 }}
        leftContent={<TriangleAlert color={theme.colors.warning} />}
        rightContent={
          <BatteryEmpty
            color={theme.colors.brandSecondary}
            size={32}
            style={{ transform: [{ rotate: '-90deg' }] }}
          />
        }
      />
    );
  };

  const renderFuelConsumption = () => {
    const performance = fuelCapacityPerformance();
    return (
      <ListItem
        title={'Fuel'}
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
        titleStyle={{
          ...theme.text.xl,
          color: theme.colors.stickyWhite,
          fontWeight: '700',
          marginLeft: -10,
        }}
        subtitleStyle={{
          marginLeft: -10,
        }}
        containerStyle={{
          backgroundColor: theme.colors.transparent,
        }}
        bottomDividerLeft={-10}
        bottomDividerColor={theme.colors.brandSecondary}
        rightContentStyle={{
          width: 60,
          alignItems: 'flex-end',
        }}
        rightContent={<Fuel color={theme.colors.brandSecondary} size={28} />}
      />
    );
  };

  if (!model) {
    return <EmptyView error message={'Model Not Found!'} />;
  }

  return (
    <View style={s.view}>
      <View style={s.timer}>
        <TimerFace
          value={timer.state.value}
          caretPosition={97}
          containerStyle={[
            s.timerContainer,
            countdownTimerEnabled && timer.state.mode === TimerMode.Initial
              ? { opacity: 0 }
              : {},
          ]}>
          <>
            {(!countdownTimerEnabled ||
              (countdownTimerEnabled &&
                timer.state.mode !== TimerMode.Initial)) && (
              <Animated.Text
                entering={FadeIn}
                exiting={FadeOut}
                style={[
                  s.timerValue,
                  timer.state.inOvertime ? s.timerValueOvertime : {},
                ]}>
                {secondsToFormat(
                  Math.abs(Math.trunc(timer.state.value / 1000)),
                  { format: 'm:ss' },
                )}
              </Animated.Text>
            )}
            {timer.state.mode === TimerMode.Armed &&
              !eventPreferences.timerUsesButtons && (
                <Text style={s.timerInfoMessage}>{'Shake to Start Timer'}</Text>
              )}
            {timer.state.mode === TimerMode.Running &&
              !eventPreferences.timerUsesButtons && (
                <Text style={s.timerInfoMessage}>{'Shake to Pause Timer'}</Text>
              )}
            {timer.state.mode === TimerMode.Paused &&
              !eventPreferences.timerUsesButtons && (
                <Text style={s.timerInfoMessage}>
                  {'Shake to Resume Timer'}
                </Text>
              )}
          </>
        </TimerFace>
        <View style={s.countdownSetupContainer}>
          {countdownTimerEnabled && timer.state.mode === TimerMode.Initial && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <View style={s.countdownTitleContainer}>
                <Text style={s.countdownTitle}>{'Minutes'}</Text>
                <Text style={s.countdownTitle}>{'Seconds'}</Text>
              </View>
              <WheelPicker
                placeholder={'none'}
                wheelVisible={[true, true]}
                itemWidth={[85, 85]}
                items={countdownTimerItems}
                labels={['', ':']}
                labelWidth={[0, 35]}
                itemHeight={60}
                visibleItemCount={3}
                itemStyle={s.wheelPickerItem}
                labelStyle={s.wheelPickerLabel}
                overlayStyle={s.wheelPickerOverlay}
                value={millisecondsToPickerMSS(countdownValue.current)}
                onValueChange={(_wheelIndex, value) =>
                  onCountdownValueChange(value as string[])
                }
              />
            </Animated.View>
          )}
        </View>
      </View>
      <View style={s.equipment}>
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
      <View style={s.controls}>
        {eventPreferences.timerUsesButtons
          ? renderTimerButtons()
          : renderTimerSwipe()}
      </View>
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
  countdownSetupContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center',
    height: '100%',
  },
  controls: {
    height: 150,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.whiteTransparentSubtle,
  },
  countdownTitle: {
    ...theme.text.normal,
    color: theme.colors.stickyWhite,
  },
  countdownTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.brandSecondary,
    paddingBottom: 10,
    marginBottom: 15,
  },
  equipment: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.whiteTransparentSubtle,
  },
  modelIcon: {
    transform: [{ rotate: '-45deg' }],
    marginRight: -15,
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
    color: theme.colors.stickyWhite,
  },
  performanceRowMid: {
    position: 'absolute',
    right: 95,
  },
  summary: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: '5%',
  },
  swipeText: {
    ...theme.text.xl,
    color: theme.colors.stickyWhite,
  },
  swipeThumbTimerRunning: {
    opacity: 0,
    pointerEvents: 'none',
  },
  timer: {
    height: device.screen.width * 0.8,
    marginTop: 15,
    paddingBottom: 15,
  },
  timerButtons: {
    flexDirection: 'row',
    paddingTop: 15,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  timerButtonDisabled: {
    opacity: 0.6,
  },
  timerContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerMessage: {
    ...theme.text.large,
    color: theme.colors.stickyWhite,
  },
  timerMessageContainer: {
    position: 'absolute',
    justifyContent: 'center',
    height: '100%',
  },
  timerInfoMessage: {
    position: 'absolute',
    bottom: -15,
    ...theme.text.medium,
    color: theme.colors.stickyWhite,
    opacity: 0.3,
  },
  timerSwipeable: {
    position: 'absolute',
    bottom: device.insets.bottom * 2,
    width: device.screen.width,
    alignItems: 'center',
  },
  timerValue: {
    textAlign: 'center',
    ...theme.text.normal,
    color: theme.colors.stickyWhite,
    fontWeight: '600',
    fontSize: 70,
    lineHeight: 70,
    marginTop: 15,
  },
  timerValueArmed: {
    opacity: 0.1,
  },
  timerValueOvertime: {
    color: theme.colors.assertive,
  },
  view: {
    ...theme.styles.view,
    backgroundColor: theme.colors.brandPrimary,
  },
  wheelPickerItem: {
    ...theme.text.giant,
    color: theme.colors.stickyWhite,
  },
  wheelPickerLabel: {
    ...theme.text.giant,
    fontWeight: '500',
    color: theme.colors.stickyWhite,
    marginTop: -10,
    alignSelf: 'center',
  },
  wheelPickerOverlay: {
    backgroundColor: theme.colors.brandSecondary,
    marginBottom: 12,
  },
}));

export default EventSequenceTimerScreen;
