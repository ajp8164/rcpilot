import { Divider, ListItem } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rn-vui/themed';
import React from 'react';
import { ScrollView } from 'react-native';
import Slider from 'react-native-ui-lib/slider';
import { AppTheme, useTheme } from 'theme';
import { ClickTrackAfterExpiring, ClickTrackWhileRunning } from 'types/event';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'PreferencesClickTrack'
>;

const PreferencesClickTrackScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

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
      <ListItem
        title={'While Running'}
        value={'None'}
        position={['first']}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'While Running',
            values: Object.values(ClickTrackWhileRunning),
            selected: ClickTrackWhileRunning.BPM30,
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
            values: Object.values(ClickTrackAfterExpiring),
            selected: ClickTrackAfterExpiring.BPM30,
            eventName: 'after-expiring',
          })
        }
      />
      <Divider
        note
        text={
          'Higher BPM values may not aloways operate smoothly  on older devices.'
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

export default PreferencesClickTrackScreen;
