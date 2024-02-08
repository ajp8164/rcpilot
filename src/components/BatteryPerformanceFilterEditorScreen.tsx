import { AppTheme, useTheme } from 'theme';
import { DateRelation, EnumRelation, FilterState, ListItemFilterDate, ListItemFilterEnum, ListItemFilterNumber, ListItemFilterString, NumberRelation, StringRelation } from 'components/molecules/filters';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BatteryPerformanceNavigatorParamList } from 'types/navigation';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useSetState } from '@react-native-ajp-elements/core';

enum BatteryPerformanceProperty {
  Date = 'date',
  Duration = 'duration',
  ChargeAmount = 'chargeAmount',
  CycleNumber = 'cycleNumber',
  Style = 'style',
  Location = 'location',
  Battery = 'battery',
  Pilot = 'pilot',
  Outcome = 'outcome',
  Notes = 'notes',
};

export type Props = NativeStackScreenProps<BatteryPerformanceNavigatorParamList, 'BatteryPerformanceFilterEditor'>;

const BatteryPerformanceFilterEditorScreen = ({ navigation: _navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const setScreenEditHeader = useScreenEditHeader();

  const [createSavedFilter, setCreateSavedFilter] = useState(false);

  const [filter, setFilter] = useSetState<{[key in BatteryPerformanceProperty]: FilterState}>({
    [BatteryPerformanceProperty.Date]: {relation: DateRelation.Any, value: []},
    [BatteryPerformanceProperty.Duration]: {relation: NumberRelation.Any, value: []},
    [BatteryPerformanceProperty.ChargeAmount]: {relation: NumberRelation.Any, value: []},
    [BatteryPerformanceProperty.CycleNumber]: {relation: StringRelation.Any, value: []},
    [BatteryPerformanceProperty.Style]: {relation: EnumRelation.Any, value: []},
    [BatteryPerformanceProperty.Location]: {relation: EnumRelation.Any, value: []},
    [BatteryPerformanceProperty.Battery]: {relation: EnumRelation.Any, value: []},
    [BatteryPerformanceProperty.Pilot]: {relation: EnumRelation.Any, value: []},
    [BatteryPerformanceProperty.Outcome]: {relation: EnumRelation.Any, value: []},
    [BatteryPerformanceProperty.Notes]: {relation: StringRelation.Any, value: []},
  });

  useEffect(() => {
    const onDone = () => {};
    setScreenEditHeader(
      {visible: true, action: onDone},
      undefined,
    );
  }, []);  

  const toggleCreateSavedFilter = (value: boolean) => {
    setCreateSavedFilter(value);
  };

  const onFilterValueChange = (property: BatteryPerformanceProperty, value: FilterState) => {
    setFilter({
      [property]: value,
    });
  };

  return (
    <ScrollView style={theme.styles.view}>
      <Divider text={'FILTER NAME'}/>
      <ListItemSwitch
        title={'Create a Saved Filter'}
        position={createSavedFilter ? ['first'] : ['first', 'last']}
        value={createSavedFilter}
        expanded={createSavedFilter}
        onValueChange={toggleCreateSavedFilter}
        ExpandableComponent={
          <ListItemInput
            placeholder={'Filter Name'}
            position={['last']}
            value={''}
            onChangeText={() => null}
          />
          }
        />
      <Divider />
      <ListItem
        title={'Reset Filter'}
        titleStyle={s.reset}
        disabled={true}
        disabledStyle={s.resetDisabled}
        position={['first', 'last']}
        rightImage={false}
        onPress={() => null}
      />
      <Divider text={'This filter shows the event cycles that match all of these criteria.'}/>
      <ListItemFilterDate
        title={'Date'}
        value={filter[BatteryPerformanceProperty.Date].value}
        relation={DateRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryPerformanceProperty.Date, filterState);
        } }
      />
      <Divider />
      <ListItemFilterNumber
        title={'Duration'}
        label={'m:ss'}
        value={filter[BatteryPerformanceProperty.Duration].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryPerformanceProperty.Duration, filterState);
        } }
      />
      <Divider />
      <ListItemFilterNumber
        title={'Charge Amt'}
        value={filter[BatteryPerformanceProperty.ChargeAmount].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryPerformanceProperty.ChargeAmount, filterState);
        } }
      />
      <Divider />
      <ListItemFilterString
        title={'Cycle Number'}
        value={filter[BatteryPerformanceProperty.CycleNumber].value}
        relation={StringRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryPerformanceProperty.CycleNumber, filterState);
        } }
      />
      <Divider />
      <ListItemFilterEnum
        title={'Style'}
        value={filter[BatteryPerformanceProperty.Style].value}
        relation={EnumRelation.Any}
        enumName={'ModelStyles'}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryPerformanceProperty.Style, filterState);
        } }
      />
      <Divider />
      <ListItemFilterEnum
        title={'Location'}
        value={filter[BatteryPerformanceProperty.Location].value}
        relation={EnumRelation.Any}
        enumName={'Locations'}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryPerformanceProperty.Location, filterState);
        } }
      />
      <Divider />
      <ListItemFilterEnum
        title={'Battery'}
        value={filter[BatteryPerformanceProperty.Battery].value}
        relation={EnumRelation.Any}
        enumName={'Batteries'}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryPerformanceProperty.Battery, filterState);
        } }
      />
      <Divider />
      <ListItemFilterEnum
        title={'Pilot'}
        value={filter[BatteryPerformanceProperty.Pilot].value}
        relation={EnumRelation.Any}
        enumName={'Pilots'}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryPerformanceProperty.Pilot, filterState);
        } }
      />
      <Divider />
      <ListItemFilterEnum
        title={'Outcome'}
        value={filter[BatteryPerformanceProperty.Outcome].value}
        relation={EnumRelation.Any}
        enumName={'Outcomes'}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryPerformanceProperty.Outcome, filterState);
        } }
      />
      <Divider />
      <ListItemFilterString
        title={'Notes'}
        value={filter[BatteryPerformanceProperty.Notes].value}
        relation={StringRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryPerformanceProperty.Notes, filterState);
        } }
      />
      <View style={{height: theme.insets.bottom}}/>
    </ScrollView>  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  reset: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderButtonText,
  },
  resetDisabled: {
    opacity: 0.3,
  }
}));

export default BatteryPerformanceFilterEditorScreen;
