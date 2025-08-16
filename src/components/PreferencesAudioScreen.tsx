import { Divider, ListItem, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView } from 'react-native';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'PreferencesAudio'
>;

const PreferencesAudioScreen = ({ navigation }: Props) => {
  const theme = useTheme();

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItem
        title={'Chime Cues'}
        position={['first']}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('PreferencesChimeCues')}
      />
      <ListItem
        title={'Voice Cues'}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('PreferencesVoiceCues')}
      />
      <ListItem
        title={'Click Track'}
        position={['last']}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('PreferencesClickTrack')}
      />
    </ScrollView>
  );
};

export default PreferencesAudioScreen;
