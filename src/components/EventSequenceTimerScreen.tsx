import Animated, { Easing, FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { AppTheme, useTheme } from 'theme';
import { Divider, Picker, PickerItem, SwipeButton, getColoredSvg, viewport } from '@react-native-ajp-elements/ui';
import { FlatList, Image, ListRenderItem, Pressable, ScrollView, Text, View } from 'react-native';
import { ListItem, ListItemSwitch, listItemPosition } from 'components/atoms/List';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { batteryPerformanceWithModel, fuelCapacityPerformanceWithModel } from 'lib/analysis';
import { useDispatch, useSelector } from 'react-redux';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { Button } from '@rneui/base';
import { EmptyView } from 'components/molecules/EmptyView';
import { Event } from 'realmdb/Event';
import { EventSequenceNavigatorParamList } from 'types/navigation';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Model } from 'realmdb/Model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SvgXml } from 'react-native-svg';
import { eventSequence } from 'store/slices/eventSequence';
import { makeStyles } from '@rneui/themed';
import { modelTypeIcons } from 'lib/model';
import { secondsToMSS } from 'lib/formatters';
import { selectEventSequence } from 'store/selectors/eventSequence';
import { useConfirmAction } from 'lib/useConfirmAction';
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

const EventSequenceTimerScreen = ({ navigation, route }: Props) => {
  const { cancelable } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const confirmAction = useConfirmAction();
  const event = useEvent();
  const dispatch = useDispatch();
  const realm = useRealm();

  const currentEventSequence = useSelector(selectEventSequence);
  const model = useObject(Model, new BSON.ObjectId(currentEventSequence.modelId));
  const [batteries, setBatteries] = useState<Battery[]>([]);

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
    navigation.setOptions({
      headerBackVisible: timerState === TimerState.Initial,
      headerLeft: () => {
        if (cancelable && timerState === TimerState.Initial) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonInvScreenHeaderTitle}
              buttonStyle={[theme.styles.buttonInvScreenHeader, s.headerButton]}
              onPress={() => confirmAction('Do Not Log Event', undefined, cancelEvent)}
            />
          )
        }
      },
    });
  }, [ timerState ]);

  useEffect(() => {
    // Get all the batteries for this event.
    const eventBatteries: Battery[] = [];
    currentEventSequence.batteryIds.forEach(id => {
      const b = realm.objectForPrimaryKey(Battery, new BSON.ObjectId(new BSON.ObjectId(id)));
      b && eventBatteries.push(b);
    });
    setBatteries(eventBatteries);
  }, []);

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
    event.on('deviceShake', onDeviceShake);
    return () => {
      event.removeListener('deviceShake', onDeviceShake);
    }
  }, []);

  const cancelEvent = () => {
    dispatch(eventSequence.reset());
    navigation.goBack();
  };

  const onDeviceShake = () => {
    console.log('device shake');
  };

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

  const renderModel = () => {
    if (!model) return null;
    return (
      <>
        <View style={{borderRadius: 10, overflow: 'hidden', marginBottom: 10, height: 100, borderWidth: 0}}>
          {model.image ?
            <Image
              source={{ uri: model.image }}
              resizeMode={'cover'}
              style={{width: '100%', height: '100%'}}
            />
          :
            <SvgXml
              xml={getColoredSvg(modelTypeIcons[model.type]?.name as string)}
              width={100}
              height={110}
              color={theme.colors.brandSecondary}
              style={[s.modelIcon, {alignSelf: 'center'}]}
            />
          }
        </View>
        <Text style={[theme.styles.textNormal, {color: theme.colors.stickyWhite, textAlign: 'center', marginBottom: 3}]}>
          {model.name}
        </Text>
        <Text style={[theme.styles.textSmall, {color: theme.colors.whiteTransparentLight, textAlign: 'center', marginBottom: 10}]}>
          {`Event Number ${model.events.length + 1}`}
        </Text>
      </>
    );
  };

  const batteryPerformance = () => {
    const stats = batteryPerformanceWithModel(model!, batteries);
    return stats.map(s => {
      return {
        style: s.style,
        count: `x${s.count}`,
        time: `${secondsToMSS(s.seconds)} (80%)`,
      };
    });
  };

  const fuelCapacityPerformance = () => {
    const stats = fuelCapacityPerformanceWithModel(model!);
    return stats.map(s => {
      return {
        style: s.style,
        count: `x${s.count}`,
        time: `${secondsToMSS(s.seconds)} (80%)`,
      };
    });
  };

  const renderBattery: ListRenderItem<Battery> = ({ item: battery, index }) => {
    const performance = batteryPerformance();
    const isCharged = battery?.cycles[battery.cycles.length - 1]?.charge || !battery?.cycles.length;
    return (
      <ListItem
        key={`${index}`}
        title={battery.name}
        subtitle={
          performance.length ?
          <View style={s.performanceContainer}>
            {performance.map((item, index) => {
              return (
                <View key={index} style={s.performanceRow}>
                  <Text style={s.performanceItem}>{item.style}</Text>
                  <Text style={[s.performanceItem, s.performanceRowMid]}>{item.count}</Text>
                  <Text style={s.performanceItem}>{item.time}</Text>
              </View>
              );
            })}
          </View>
          :
          <View style={s.performanceContainer}>
            <View style={s.performanceRow}>
              <Text style={s.performanceItem}>{'No recent flights with this model'}</Text>
            </View>
          </View>
        }
        containerStyle={s.listItemContainer}
        titleStyle={[s.listItemTitle, s.batteryTitle]}
        position={listItemPosition(index, batteries.length)}
        rightImage={false}
        leftImage={
          <View style={s.batteryIconContainer}>
            <Icon
              name={isCharged ? 'battery-full' : 'battery-quarter'}
              solid={true}
              size={28}
              color={theme.colors.brandSecondary}
              style={s.batteryIcon}
            />
          </View>
        }
    />
    )
  };

  const renderNoBatteries = () => {
    return (
      <ListItem
        title={'Battery Logging'}
        subtitle={'No batteries were selected'}
        position={['last']}
        containerStyle={s.listItemContainer}
        titleStyle={s.listItemTitle}
        rightImage={false}
        leftImage={
          <View>
            <Icon
              name={'triangle-exclamation'}
              size={22}
              color={theme.colors.warning}
            />
          </View>
        }
      />
    );
  };

  const renderFuelConsumption = () => {
    const performance = fuelCapacityPerformance();
    return (
      <ListItem
        title={'Fuel Consumption Averages'}
        subtitle={
          performance.length ?
            <View style={s.performanceContainer}>
              {performance.map((item, index) => {
                return (
                  <View key={index} style={s.performanceRow}>
                    <Text style={s.performanceItem}>{item.style}</Text>
                    <Text style={[s.performanceItem, s.performanceRowMid]}>{item.count}</Text>
                    <Text style={s.performanceItem}>{item.time}</Text>
                </View>
                );
              })}
            </View>
          :
            <View style={s.performanceContainer}>
              <View style={s.performanceRow}>
                <Text style={s.performanceItem}>{'No recent flights with this model'}</Text>
              </View>
            </View>
        }
        containerStyle={s.listItemContainer}
        titleStyle={[s.listItemTitle, s.fuelTitle]}
        position={['first', 'last']}
        rightImage={false}
        leftImage={
          <View style={s.batteryIconContainer}>
            <Icon
              name={'gas-pump'}
              solid={true}
              size={26}
              color={theme.colors.brandSecondary}
              style={s.fuelIcon}
            />
          </View>
        }
      />
    );
  };

  if (!model) {
    return (
      <EmptyView error message={'Model Not Found!'} />
    );    
  }

  return (
    <View style={s.view}>
      <View style={s.upper}>
        {(!countdownTimerEnabled || (countdownTimerEnabled && timerState !== TimerState.Initial)) && 
          <Animated.Text
            entering={FadeIn} exiting={FadeOut}
            style={[s.timerValue, timerState === TimerState.Armed ? s.timerValueArmed : {}]}>
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
          {model.logsBatteries &&
            <FlatList
              data={batteries}
              renderItem={renderBattery}
              keyExtractor={(_item, index) => `${index}`}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={renderModel()}
              ListFooterComponent={<Divider />}
              ListEmptyComponent={renderNoBatteries()}
            />
          }
          {model.logsFuel &&
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderModel()}
              {renderFuelConsumption()}
              <Divider />
            </ScrollView>
          }
        </View>
      </View>
      {timerUsesButtons ?
        <View style={s.timerButtons}>
          {renderTimerButtons()}
        </View>
        :
        <View style={s.timerSwipeable}>
          <SwipeButton
            trackColor={timerState === TimerState.Running
              ? theme.colors.blackTransparentSubtle
              : theme.colors.assertive
            }
            text={'Slide to arm'}
            textStyle={s.swipeText}
            backText={timerState === TimerState.Running ? 'Timer running' : 'Slide to disarm'}
            backTextStyle={s.swipeText}
            padding={7}
            height={60}
            width={viewport.width - 45}
            trackStartColor={timerState === TimerState.Running
              ? theme.colors.blackTransparentSubtle
              : theme.colors.success
            }
            trackEndColor={timerState === TimerState.Running
              ? theme.colors.blackTransparentSubtle
              : theme.colors.success
            }
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
    backgroundColor: theme.colors.brandPrimary,
  },
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  modelIcon: {
    transform: [{rotate: '-45deg'}],
  },
  batteryIconContainer: {
    position: 'absolute',
    top: 3,
  },
  batteryIcon: {
    transform: [{rotate: '-90deg'}],
    width: '100%',
    left: -8,
  },
  performanceContainer: {
    paddingTop: 5,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 25,
    paddingRight: 5,
  },
  performanceItem: {
    ...theme.styles.textSmall,
    color: theme.colors.whiteTransparentLight,
  },
  performanceRowMid: {
    position: 'absolute',
    right: 95,
  },
  batteryTitle: {
    left: 25,
  },
  fuelIcon: {
    width: '100%',
    left: -2,
  },
  fuelTitle: {
    left: 25,
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
