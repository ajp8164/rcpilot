import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSegmented, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BatteryFiltersNavigatorParamList } from 'types/navigation';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';
import { useSetState } from '@react-native-ajp-elements/core';

enum BatteryProperty {
  Chemistry = 'chemistry',
  TotalTime = 'totalTime',
  Capacity = 'capacity',
  CRating = 'cRating',
  SCells = 'sCells',
  PCells = 'pCells',
};

type FilterState = {
  editing: boolean;
  value: string;
};

export type Props = NativeStackScreenProps<BatteryFiltersNavigatorParamList, 'BatteryFilterEditor'>;

const BatteryFilterEditorScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [createSavedFilter, setCreateSavedFilter] = useState(false);
  const [filter, setFilter] = useSetState<{[key in BatteryProperty] : FilterState}>({
    [BatteryProperty.Chemistry]: {editing: false, value: ''},
    [BatteryProperty.TotalTime]: {editing: false, value: ''},
    [BatteryProperty.Capacity]: {editing: false, value: ''},
    [BatteryProperty.CRating]: {editing: false, value: ''},
    [BatteryProperty.SCells]: {editing: false, value: ''},
    [BatteryProperty.PCells]: {editing: false, value: ''},
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

  const onOperatorSelect = (property: BatteryProperty, index: number) => {
    // Set editing state while leaving the value unchanged.
    setFilter({
      [property]: {
        editing: index > 0,
        value: filter[property].value,
      }
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
        title={'Reset Filter...'}
        titleStyle={s.reset}
        disabled={true}
        disabledStyle={s.resetDisabled}
        position={['first', 'last']}
        rightImage={false}
        onPress={() => null}
      />
      <Divider text={'This filter shows all the models that match all of these criteria.'}/>
      <ListItemSegmented
        title={'Chemistry'}
        position={filter[BatteryProperty.Chemistry].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: '  Is  ' }, { label: 'Is Not' }]}
        onChangeIndex={index => onOperatorSelect(BatteryProperty.Chemistry, index)}
        expanded={filter[BatteryProperty.Chemistry].editing}
        ExpandableComponent={
          <ListItem
            title={'Any of these values...'}
            titleStyle={!filter[BatteryProperty.Chemistry].value ? {color: theme.colors.assertive} : {}}
            subtitle={filter[BatteryProperty.Chemistry].value || 'None'}
            position={['last']}
            onPress={() => navigation.navigate('BatteryFilterChemistry')}
          />
        }
      />
      <Divider />
      <ListItemSegmented
        title={'Total Time'}
        position={filter[BatteryProperty.TotalTime].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: '  <  ' }, { label: '  >  ' }, { label: '  =  ' }, { label: '  !=  ' }]}
        onChangeIndex={index => onOperatorSelect(BatteryProperty.TotalTime, index)}
        expanded={filter[BatteryProperty.TotalTime].editing}
        ExpandableComponent={
          <ListItemInput
            title={'Value'}
            label={'h:mm'}
            position={['last']}
            onChangeText={() => null}
            value={filter[BatteryProperty.TotalTime].value}
          />
        }
      />
      <Divider />
      <ListItemSegmented
        title={'Capacity'}
        position={filter[BatteryProperty.Capacity].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: '  <  ' }, { label: '  >  ' }, { label: '  =  ' }, { label: '  !=  ' }]}
        onChangeIndex={index => onOperatorSelect(BatteryProperty.Capacity, index)}
        expanded={filter[BatteryProperty.Capacity].editing}
        ExpandableComponent={
          <ListItemInput
            title={'Value'}
            position={['last']}
            value={filter[BatteryProperty.Capacity].value}
            onChangeText={() => null}
          />
        }
      />
      <Divider />
      <ListItemSegmented
        title={'C Rating'}
        position={filter[BatteryProperty.CRating].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: '  <  ' }, { label: '  >  ' }, { label: '  =  ' }, { label: '  !=  ' }]}
        onChangeIndex={index => onOperatorSelect(BatteryProperty.CRating, index)}
        expanded={filter[BatteryProperty.CRating].editing}
        ExpandableComponent={
          <ListItemInput
            title={'Value'}
            position={['last']}
            value={filter[BatteryProperty.CRating].value}
            onChangeText={() => null}
          />
        }
      />
      <Divider />
      <ListItemSegmented
        title={'S Cells'}
        position={filter[BatteryProperty.SCells].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: '  <  ' }, { label: '  >  ' }, { label: '  =  ' }, { label: '  !=  ' }]}
        onChangeIndex={index => onOperatorSelect(BatteryProperty.SCells, index)}
        expanded={filter[BatteryProperty.SCells].editing}
        ExpandableComponent={
          <ListItemInput
            title={'Value'}
            position={['last']}
            value={filter[BatteryProperty.SCells].value}
            onChangeText={() => null}
          />
        }
      />
      <Divider />
      <ListItemSegmented
        title={'P Cells'}
        position={filter[BatteryProperty.PCells].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: '  <  ' }, { label: '  >  ' }, { label: '  =  ' }, { label: '  !=  ' }]}
        onChangeIndex={index => onOperatorSelect(BatteryProperty.PCells, index)}
        expanded={filter[BatteryProperty.PCells].editing}
        ExpandableComponent={
          <ListItemInput
            title={'Value'}
            position={['last']}
            value={filter[BatteryProperty.PCells].value}
            onChangeText={() => null}
          />
        }
      />
      <View style={{height: theme.insets.bottom}}/>
    </ScrollView>  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
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
    textAlign: 'center'
  },
  resetDisabled: {
    opacity: 0.3
  }
}));

export default BatteryFilterEditorScreen;
