import { AppTheme, useTheme } from 'theme';
import { DateRelation, FilterState, ListItemFilterDate, ListItemFilterNumber, ListItemFilterString, NumberRelation, StringRelation } from 'components/molecules/filters';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BatteryCycleFiltersNavigatorParamList } from 'types/navigation';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useSetState } from '@react-native-ajp-elements/core';

enum BatteryCycleProperty {
  DischargeDate = 'dischargeDate',
  DischargeDuration = 'dischargeDuration',
  ChargeDate = 'chargeDate',
  ChargeAmount = 'chargeAmount',
  Notes = 'notes',
};

export type Props = NativeStackScreenProps<BatteryCycleFiltersNavigatorParamList, 'BatteryCycleFilterEditor'>;

const BatteryCycleFilterEditorScreen = ({ navigation: _navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const setScreenEditHeader = useScreenEditHeader();

  const [createSavedFilter, setCreateSavedFilter] = useState(false);

  const [filter, setFilter] = useSetState<{[key in BatteryCycleProperty] : FilterState}>({
    [BatteryCycleProperty.DischargeDate]: {relation: DateRelation.Any, value: []},
    [BatteryCycleProperty.DischargeDuration]: {relation: NumberRelation.Any, value: []},
    [BatteryCycleProperty.ChargeDate]: {relation: DateRelation.Any, value: []},
    [BatteryCycleProperty.ChargeAmount]: {relation: NumberRelation.Any, value: []},
    [BatteryCycleProperty.Notes]: {relation: StringRelation.Any, value: []},
  });

  useEffect(() => {
    const onDone = () => {};
    setScreenEditHeader({enabled: true, action: onDone});
  }, []);  

  const toggleCreateSavedFilter = (value: boolean) => {
    setCreateSavedFilter(value);
  };

  const onFilterValueChange = (property: BatteryCycleProperty, value: FilterState) => {
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
      <Divider text={'This filter shows all the batteries that match all of these criteria.'}/>
      <ListItemFilterDate
        title={'Discharge Date'}
        value={filter[BatteryCycleProperty.DischargeDate].value}
        relation={DateRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryCycleProperty.DischargeDate, filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Discharge Duration'}
        label={'m:ss'}
        value={filter[BatteryCycleProperty.DischargeDuration].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryCycleProperty.DischargeDuration, filterState);
        }}
      />
      <Divider />
      <ListItemFilterDate
        title={'Charge Date'}
        value={filter[BatteryCycleProperty.ChargeDate].value}
        relation={DateRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryCycleProperty.ChargeDate, filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Charge Amount'}
        label={'mAh'}
        value={filter[BatteryCycleProperty.ChargeAmount].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryCycleProperty.ChargeAmount, filterState);
        }}
      />
      <Divider />
      <ListItemFilterString
        title={'Notes'}
        value={filter[BatteryCycleProperty.Notes].value}
        relation={StringRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(BatteryCycleProperty.Notes, filterState);
        }}
      />
      <View style={{height: theme.insets.bottom}}/>
    </ScrollView>
  );
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

export default BatteryCycleFilterEditorScreen;
