import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput } from 'components/atoms/List';
import { ModelsNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import { ScrollView, View } from 'react-native';

import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '@rneui/themed';

export type Props = 
  NativeStackScreenProps<SetupNavigatorParamList, 'FlightDetails'> &
  NativeStackScreenProps<ModelsNavigatorParamList, 'FlightDetails'>;

const FlightDetailsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const rating = (): JSX.Element => {
    const stars = [];
    for (let  i = 0; i < 4; i++) {
      stars.push(<Icon name={'star'} />);
    }
    return (
      <View style={s.rating}>
        {stars}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider />
        <ListItem
          title={'Blade 150S'}
          subtitle={'Blade'}
          position={['first', 'last']}
          rightImage={false}
          onPress={() => null}
        />
        <Divider />
        <ListItem
          title={'Date'}
          value={'Nov 4, 2023 at 11:49PM'}
          position={['first']}
        />
        <ListItemInput
          title={'Duration'}
          label={'m:ss'}
          value={'4:00'}
          keyboardType={'number-pad'}
          onChangeText={() => null}
        /> 
        <ListItem
          title={'Location'}
          value={'Nickajack Elementary School'}
        />
        <ListItem
          title={'Outcome'}
          value={rating()}
          position={['last']}
        />
        <Divider />
        <ListItem
          title={'Fuel'}
          position={['first']}
          value={'Unspecified'}
          onPress={() => null}
        />
        <ListItemInput
          title={'Fuel Consumed'}
          label={'oz'}
          value={'Value'}
          keyboardType={'number-pad'}
          position={['last']}
          onChangeText={() => null}
         /> 
        <Divider />
        <ListItem
          title={'Pilot'}
          position={['first']}
          value={'Andy'}
          onPress={() => null}
        />
        <ListItem
          title={'Style'}
          position={['last']}
          value={'Sport'}
          onPress={() => null}
        />
        <Divider text={'NOTES'} />
        <ListItem
          title={'Notes'}
          position={['first', 'last']}
          onPress={() => navigation.navigate('Notes', {})}
        />
        <Divider text={'BATTERY USED'} />
        <ListItem
          title={'150S #1,3S/1P LiPo'}
          subtitle={'Cycle 20  out of 22\nDischarge at 13.5A (30C) average, rest at unknown voltages\nCharge replaces 900mAh, rest at 3.8V (1.3V/Cell'}
          position={['first', 'last']}
          onPress={() => null}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  rating: {
    flexDirection: 'row',
  }
}));

export default FlightDetailsScreen;
