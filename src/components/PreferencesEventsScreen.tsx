import { AppTheme, useTheme } from 'theme';
import React, { useState } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { ListItem } from 'components/atoms/List';
import { ListItemSwitch } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView } from 'react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { Slider } from 'react-native-ui-lib';
import { TimerStartDelay } from 'types/event';
import { makeStyles } from '@rn-vui/themed';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'PreferencesEvents'
>;

const PreferencesEventsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [atFieldSingleTapEnabled, setAtFieldSingleTapEnabled] = useState(false);
  const [atFieldUsesTimerEnabled, setFieldUsesTimerEnabled] = useState(false);
  const [timerUsesButtonsEnabled, setTimerUsesButtonsEnabled] = useState(false);
  const [defaultFromLastEventEnabled, setDefaultFromLastEventEnabled] =
    useState(false);

  const toggleAtFieldSingleTap = (value: boolean) => {
    setAtFieldSingleTapEnabled(value);
  };

  const toggleFieldUsesTimer = (value: boolean) => {
    setFieldUsesTimerEnabled(value);
  };

  const toggleTimerUsesButtons = (value: boolean) => {
    setTimerUsesButtonsEnabled(value);
  };

  const toggleDefaultFromLastEvent = (value: boolean) => {
    setDefaultFromLastEventEnabled(value);
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItemSwitch
        title={'"At Field" via Single Tap'}
        value={atFieldSingleTapEnabled}
        position={['first']}
        onValueChange={toggleAtFieldSingleTap}
      />
      <ListItemSwitch
        title={'"At Field" Uses Timer'}
        value={atFieldUsesTimerEnabled}
        onValueChange={toggleFieldUsesTimer}
      />
      <ListItemSwitch
        title={'Timer Uses Buttons'}
        value={timerUsesButtonsEnabled}
        onValueChange={toggleTimerUsesButtons}
      />
      <ListItem
        title={'Timer Start Delay'}
        value={'None'}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'Timer Start Delay',
            values: Object.values(TimerStartDelay),
            selected: TimerStartDelay.Seconds15,
            eventName: 'timer-start-delay',
          })
        }
      />
      <ListItemSwitch
        title={'Default from Last Event'}
        value={defaultFromLastEventEnabled}
        position={['last']}
        onValueChange={toggleDefaultFromLastEvent}
      />
      <Divider
        note
        text={
          'Default from last event will only apply when you are not using the event timer.'
        }
      />
      <Divider text={'EVENT TIMER SHAKE SENSITIVITY'} />
      <Slider
        value={0.5}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor={theme.colors.brandPrimary}
        thumbTintColor={theme.colors.stickyWhite}
        containerStyle={s.sliderContainer}
        onValueChange={() => null}
      />
      <Divider
        note
        text={
          'Adjusts the sensitivity of the application to shake gestures to operate the timer.'
        }
      />
      <Divider text={'EVENT LOCATION SENSITIVITY'} />
      <Slider
        value={0.5}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor={theme.colors.brandPrimary}
        thumbTintColor={theme.colors.stickyWhite}
        containerStyle={s.sliderContainer}
        onValueChange={() => null}
      />
      <Divider
        note
        text={
          'Adjusts the sensitivity of database locations. Lower implies locations cover a larger area.'
        }
      />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  sliderContainer: {
    paddingHorizontal: 5,
  },
}));

export default PreferencesEventsScreen;
