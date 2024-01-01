import { AppTheme, useTheme } from 'theme';
import { AudioVoice, VoiceAfterExpiring, VoiceWhileRunning } from 'types/event';

import { Divider } from '@react-native-ajp-elements/ui';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView } from 'react-native';
import {
  SetupNavigatorParamList,
} from 'types/navigation';
import { Slider } from 'react-native-ui-lib';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'PreferencesVoiceCues'>;

const PreferencesVoiceCuesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'RELATIVE VOLUME'}/>
      <Slider
        value={0.5}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor={theme.colors.brandPrimary}
        thumbTintColor={theme.colors.stickyWhite}
        containerStyle={s.sliderContainer}
        onValueChange={() => null}
      />
      <Divider text={'SETTINGS'}/>
      <ListItem
        title={'Voice'}
        value={'Alex'}
        position={['first']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'Voice',
          values: Object.values(AudioVoice),
          selected: AudioVoice.Alex,
          eventName: 'audio-voice',
        })}
      />
      <ListItem
        title={'While Running'}
        value={'None'}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'While Running',
          values: Object.values(VoiceWhileRunning),
          selected: VoiceWhileRunning.Minutes1,
          eventName: 'while-running',
        })}
      />
      <ListItem
        title={'After Expiring'}
        value={'None'}
        position={['last']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'After Expiring',
          values: Object.values(VoiceAfterExpiring),
          selected: VoiceAfterExpiring.Minutes1,
          eventName: 'after-expiring',
        })}
      />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  sliderContainer: {
    paddingHorizontal: 5,
  },
}));

export default PreferencesVoiceCuesScreen;
