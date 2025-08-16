import {
  Divider,
  ListItem,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView } from 'react-native';
import Slider from 'react-native-ui-lib/slider';
import { AudioVoice, VoiceAfterExpiring, VoiceWhileRunning } from 'types/event';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'PreferencesVoiceCues'
>;

const PreferencesVoiceCuesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();

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
        title={'Voice'}
        value={'Alex'}
        position={['first']}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'Voice',
            values: Object.values(AudioVoice),
            selected: AudioVoice.Alex,
            eventName: 'audio-voice',
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
            values: Object.values(VoiceWhileRunning),
            selected: VoiceWhileRunning.Minutes1,
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
            values: Object.values(VoiceAfterExpiring),
            selected: VoiceAfterExpiring.Minutes1,
            eventName: 'after-expiring',
          })
        }
      />
    </ScrollView>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  sliderContainer: {
    paddingHorizontal: 5,
  },
}));

export default PreferencesVoiceCuesScreen;
