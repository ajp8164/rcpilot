import { AppTheme, useTheme } from 'theme';
import { BatteryFiltersNavigatorParamList, BatteryPerformanceNavigatorParamList } from 'types/navigation';
import { DateRelation, EnumRelation, ListItemFilterDate, ListItemFilterEnum, ListItemFilterNumber, ListItemFilterString, NumberRelation, StringRelation } from 'components/molecules/filters';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';
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

type FilterState = {
  relation: DateRelation | EnumRelation | NumberRelation | StringRelation;
  value: string;
};

export type Props = NativeStackScreenProps<BatteryPerformanceNavigatorParamList, 'BatteryPerformanceFilterEditor'>;

const BatteryPerformanceFilterEditorScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [createSavedFilter, setCreateSavedFilter] = useState(false);

  const [filter, setFilter] = useSetState<{[key in BatteryPerformanceProperty]: FilterState}>({
    [BatteryPerformanceProperty.Date]: {relation: DateRelation.Any, value: ''},
    [BatteryPerformanceProperty.Duration]: {relation: NumberRelation.Any, value: ''},
    [BatteryPerformanceProperty.ChargeAmount]: {relation: NumberRelation.Any, value: ''},
    [BatteryPerformanceProperty.CycleNumber]: {relation: StringRelation.Any, value: ''},
    [BatteryPerformanceProperty.Style]: {relation: EnumRelation.Any, value: ''},
    [BatteryPerformanceProperty.Location]: {relation: EnumRelation.Any, value: ''},
    [BatteryPerformanceProperty.Battery]: {relation: EnumRelation.Any, value: ''},
    [BatteryPerformanceProperty.Pilot]: {relation: EnumRelation.Any, value: ''},
    [BatteryPerformanceProperty.Outcome]: {relation: EnumRelation.Any, value: ''},
    [BatteryPerformanceProperty.Notes]: {relation: StringRelation.Any, value: ''},
  });

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button
          title={'Cancel'}
          titleStyle={theme.styles.buttonClearTitle}
          buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
          onPress={() => navigation.goBack()}
        />
      ),
      headerRight: () => (
        <Button
          title={'Update'}
          titleStyle={theme.styles.buttonClearTitle}
          buttonStyle={[theme.styles.buttonClear, s.updateButton]}
          onPress={() => null}
        />
      ),
    });
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
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryPerformanceProperty.Date, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterNumber
        title={'Duration'}
        label={'m:ss'}
        value={filter[BatteryPerformanceProperty.Duration].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryPerformanceProperty.Duration, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterNumber
        title={'Charge Amt'}
        value={filter[BatteryPerformanceProperty.ChargeAmount].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryPerformanceProperty.ChargeAmount, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterString
        title={'Cycle Number'}
        value={filter[BatteryPerformanceProperty.CycleNumber].value}
        relation={StringRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryPerformanceProperty.CycleNumber, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterEnum
        title={'Style'}
        value={filter[BatteryPerformanceProperty.Style].value}
        relation={EnumRelation.Any}
        enumName={'ModelStyles'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryPerformanceProperty.Style, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterEnum
        title={'Location'}
        value={filter[BatteryPerformanceProperty.Location].value}
        relation={EnumRelation.Any}
        enumName={'Locations'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryPerformanceProperty.Location, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterEnum
        title={'Battery'}
        value={filter[BatteryPerformanceProperty.Battery].value}
        relation={EnumRelation.Any}
        enumName={'Batteries'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryPerformanceProperty.Battery, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterEnum
        title={'Pilot'}
        value={filter[BatteryPerformanceProperty.Pilot].value}
        relation={EnumRelation.Any}
        enumName={'Pilots'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryPerformanceProperty.Pilot, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterEnum
        title={'Outcome'}
        value={filter[BatteryPerformanceProperty.Outcome].value}
        relation={EnumRelation.Any}
        enumName={'Outcomes'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryPerformanceProperty.Outcome, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterString
        title={'Notes'}
        value={filter[BatteryPerformanceProperty.Notes].value}
        relation={StringRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryPerformanceProperty.Notes, {relation, value});
        } }
      />
      <View style={{height: theme.insets.bottom}}/>
    </ScrollView>  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  updateButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  reset: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderBackButton,
  },
  resetDisabled: {
    opacity: 0.3,
  }
}));

export default BatteryPerformanceFilterEditorScreen;