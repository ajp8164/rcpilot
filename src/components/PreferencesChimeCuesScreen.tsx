import { Divider, ListItem, ListItemSwitch } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rn-vui/themed';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import Slider from 'react-native-ui-lib/slider';
import { AppTheme, useTheme } from 'theme';
import {
  ChimeAfterExpiring,
  ChimeWhileArmed,
  ChimeWhileRunning,
} from 'types/event';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'PreferencesChimeCues'
>;

const PreferencesChimeCuesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [atFieldSingleTapEnabled, setAtFieldSingleTapEnabled] = useState(false);
  const [atFieldUsesTimerEnabled, setAtFieldUsesTimerEnabled] = useState(false);

  const toggleAtFieldSingleTap = (value: boolean) => {
    setAtFieldSingleTapEnabled(value);
  };

  const toggleAtFieldUsesTimer = (value: boolean) => {
    setAtFieldUsesTimerEnabled(value);
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'RELATIVE VOLUME'} />
      <Slider
        value={0.5}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor={theme.colors.brandPrimary}
        thumbTintColor={theme.colors.stickyWhite}
        containerStyle={s.sliderContainer}
        onValueChange={() => null}
      />
      <Divider text={'SETTINGS'} />
      <ListItemSwitch
        title={'Audible Chime'}
        value={atFieldSingleTapEnabled}
        position={['first']}
        onValueChange={toggleAtFieldSingleTap}
      />
      <ListItemSwitch
        title={'Vibrate on Chime'}
        value={atFieldUsesTimerEnabled}
        onValueChange={toggleAtFieldUsesTimer}
      />
      <ListItem
        title={'While Armed'}
        value={'None'}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'While Armed',
            values: Object.values(ChimeWhileArmed),
            selected: ChimeWhileArmed.Seconds15,
            eventName: 'while-armed',
          })
        }
      />
      <ListItem
        title={'While Running'}
        value={'None'}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'While Running',
            values: Object.values(ChimeWhileRunning),
            selected: ChimeWhileRunning.Minutes1,
            eventName: 'while-running',
          })
        }
      />
      <ListItem
        title={'After Expiring'}
        value={'None'}
        position={['last']}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'After Expiring',
            values: Object.values(ChimeAfterExpiring),
            selected: ChimeAfterExpiring.Seconds15,
            eventName: 'after-expiring',
          })
        }
      />
      <Divider note text={'Vibration is not supported on all devices.'} />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  sliderContainer: {
    paddingHorizontal: 5,
  },
}));

export default PreferencesChimeCuesScreen;
