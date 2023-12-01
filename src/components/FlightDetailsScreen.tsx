import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput } from 'components/atoms/List';
import { ModelsNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import React, { useEffect } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { FlightOutcome } from 'types/flight';
import { FlightRating } from 'components/molecules/FlightRating';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { enumIdsToValues } from 'lib/utils';
import { flightOutcomeIcons } from 'lib/flight';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

export type Props = 
  NativeStackScreenProps<SetupNavigatorParamList, 'FlightDetails'> &
  NativeStackScreenProps<ModelsNavigatorParamList, 'FlightDetails'>;

const FlightDetailsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const event = useEvent();

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

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('fuel', onChangeFuel);
    event.on('model-style', onChangeModelStyle);
    event.on('outcome', onChangeOutcome);
    event.on('pilot', onChangePilot);

    return () => {
      event.removeListener('fuel', onChangeFuel);
      event.removeListener('model-style', onChangeModelStyle);
      event.removeListener('outcome', onChangeOutcome);
      event.removeListener('pilot', onChangePilot);
    };
  }, []);

  const onChangeFuel = (v: string) => {};
  const onChangeModelStyle = (v: string) => {};
  const onChangeOutcome = (v: string) => {};
  const onChangePilot = (v: string) => {};

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
          position={['last']}
          value={<FlightRating value={FlightOutcome.Star3}/>}
          onPress={() => navigation.navigate('EnumPicker', {
            title: 'Flight Outcome',
            headerBackTitle: 'Flight',
            values: Object.values(FlightOutcome),
            icons: flightOutcomeIcons,
            selected: FlightOutcome.Star3,
            eventName: 'outcome',
          })}
        />
        <Divider />
        <ListItem
          title={'Fuel'}
          position={['first']}
          value={'Unspecified'}
          onPress={() => navigation.navigate('EnumPicker', {
            title: 'Fuel',
            headerBackTitle: 'Flight',
            footer: 'You can manage fuels through the Globals section in the Setup tab.',
            values: Object.values(fuels),
            selected: enumIdsToValues(['id2'], fuels),
            eventName: 'fuel',
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
            headerBackTitle: 'Flight',
            footer: 'You can manage pilots through the Globals section in the Setup tab.',
            values: Object.values(pilots),
            selected: enumIdsToValues(['id2'], pilots),
            eventName: 'pilot',
          })}
        />
        <ListItem
          title={'Style'}
          position={['last']}
          value={'Sport'}
          onPress={() => navigation.navigate('EnumPicker', {
            title: 'Style',
            headerBackTitle: 'Flight',
            footer: 'You can manage styles through the Globals section in the Setup tab.',
            values: Object.values(modelStyles),
            selected: enumIdsToValues(['id2'], modelStyles),
            eventName: 'model-style',
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
