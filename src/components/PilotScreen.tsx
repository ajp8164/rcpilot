import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput } from 'components/atoms/List';
import React, { useEffect } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Pilot'>;

const PilotScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  useEffect(() => {
    navigation.setOptions({
      title: 'Andy',
    });
  }, []);

  return (
    <SafeAreaView edges={['left', 'right']} style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={"PILOT'S NAME"}/>
        <ListItemInput
          value={'Andy'}
          placeholder={'Pilot Name'}
          position={['first', 'last']}
          onChangeText={() => null}
        /> 
        <Divider text={'MODEl USAGE'}/>
        <ListItem
          title={'Blade 150S'}
          value={'0:04, 1 event'}
          position={['first', 'last']}
          onPress={() => null}
        />
        <Divider type={'note'} text={'Total duration (H:MM) and number of events of each style for events piloted by Andy.'}/>
        <Divider text={'EVENT STYLES'}/>
        <ListItem
          title={'Sport'}
          value={'0:04, 1 event'}
          position={['first', 'last']}
          onPress={() => null}
        />
        <Divider type={'note'} text={'Total duration (H:MM) and number of events of each style for events piloted by Andy.'}/>
        <Divider text={'MANAGING FAVORITE MODELS'}/>
        <ListItem
          title={'Select Favorite Models...'}
          titleStyle={s.favorite}
          position={['first', 'last']}
          rightImage={false}
          onPress={() => null}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  favorite: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderBackButton
  },
}));

export default PilotScreen;
