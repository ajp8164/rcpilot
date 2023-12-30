import { AppTheme, useTheme } from 'theme';
import { SectionList, SectionListData, Text, View } from 'react-native';

import { DateTime } from 'luxon';
import { Flight } from 'types/flight';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Flights'>;

const FlightsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const flights: Flight[] = [{
    id: '1',
    flightNumber: 2,
    date: '2023-11-17T03:28:04.651Z',
  }];

  const groupFlights = (flight: Flight[]): SectionListData<Flight>[] => {
    const groupedFlights: {
      [key in string]: Flight[];
    } = {};

    flights.forEach(flight => {
      const groupTitle = DateTime.fromISO(flight.date).toFormat(
        'MMMM yyyy',
      );
      groupedFlights[groupTitle] = groupedFlights[groupTitle] || [];
      groupedFlights[groupTitle].push(flight);
    });

    const flightsSectionData: SectionListData<Flight>[] = [];
    Object.keys(groupedFlights).forEach(group => {
      flightsSectionData.push({
        title: group,
        data: groupedFlights[group],
      });
    });

    return flightsSectionData;
  };

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={s.sectionList}
      sections={groupFlights(flights)}
      keyExtractor={item => item.id}
      renderItem={({item: flight, index, section}) => (
        <ListItem
          key={index}
          title={`#${flight.flightNumber}, 4*: 4:00 at 11:49PM, Nickajack Elementary School`}
          subtitle={`Fuel: 0.0oz; Batt: 150S #1`}
          containerStyle={{marginHorizontal: 15}}
          position={section.data.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === section.data.length - 1 ? ['last'] : []}
          onPress={() => navigation.navigate('FlightDetails', {
            flightId: '1'
          })}
        />
      )}
      renderSectionHeader={({section: {title}}) => (
        <View style={s.sectionHeaderContainer}>
          <Text style={s.sectionHeader}>
            {title}
          </Text>
        </View>
      )}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
  sectionHeaderContainer: {
    height: 35,
    paddingTop: 12,
    paddingHorizontal: 25,
    backgroundColor: theme.colors.listHeaderBackground,
  },
  sectionHeader: {
    ...theme.styles.textSmall,
    ...theme.styles.textDim
  },
}));

export default FlightsScreen;
