import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput } from 'components/atoms/List';
import { ModelsNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';

import { Divider } from '@react-native-ajp-elements/ui';
import { FlightOutcome } from 'types/flight';
import { FlightRating } from 'components/molecules/FlightRating';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = 
  NativeStackScreenProps<SetupNavigatorParamList, 'FlightDetails'> &
  NativeStackScreenProps<ModelsNavigatorParamList, 'FlightDetails'>;

const FlightDetailsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const fuels = {
    'id0': 'High Octane',
    'id2': 'Unspecified'
  };
  const modelStyles = {
    'id0': '3D',
    'id1': 'Sport',
    'id2': 'None'
  };
  const pilots = {
    'id0': 'Andy',
    'id2': 'Unknown'
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
          value={<FlightRating value={FlightOutcome.Star4}/>}
          position={['last']}
          onPress={() => navigation.navigate('FlightOutcome', {
            flightOutcome: FlightOutcome.Star4,
          })}
        />
        <Divider />
        <ListItem
          title={'Fuel'}
          position={['first']}
          value={'Unspecified'}
          onPress={() => navigation.navigate('EnumPicker', {
            title: 'Fuel',
            kind: 'fuel',
            values: fuels,
            selected: 'id2',
          })}
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
          onPress={() => navigation.navigate('EnumPicker', {
            title: 'Pilot',
            kind: 'pilots',
            values: pilots,
            selected: 'id0',
          })}
        />
        <ListItem
          title={'Style'}
          position={['last']}
          value={'Sport'}
          onPress={() => navigation.navigate('EnumPicker', {
            title: 'Style',
            kind: 'styles',
            values: modelStyles,
            selected: 'id2',
          })}
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
  outcome: {
    flexDirection: 'row',
  }
}));

export default FlightDetailsScreen;
