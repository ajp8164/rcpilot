import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemDate, ListItemInput, ListItemSegmented, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@rneui/base';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { ModelFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';
import { useSetState } from '@react-native-ajp-elements/core';

enum ModelProperty {
  ModelType = 'modelType',
  LastEvent ='lastEvent',
  TotalTime = 'totalTime',
  LogBatteries = 'logBatteries',
  LogFuel = 'logFuel',
  Damaged = 'damaged',
  Vendor = 'vendor',
  Notes = 'notes',
};

type FilterState = {
  editing: boolean;
  value: string;
};

export type Props = NativeStackScreenProps<ModelFiltersNavigatorParamList, 'ModelFilterEditor'>;

const ModelFilterEditorScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [createSavedFilter, setCreateSavedFilter] = useState(false);
  const [filter, setFilter] = useSetState<{[key in ModelProperty] : FilterState}>({
    [ModelProperty.ModelType]: {editing: false, value: ''},
    [ModelProperty.LastEvent]: {editing: false, value: ''},
    [ModelProperty.TotalTime]: {editing: false, value: ''},
    [ModelProperty.LogBatteries]: {editing: false, value: ''},
    [ModelProperty.LogFuel]: {editing: false, value: ''},
    [ModelProperty.Damaged]: {editing: false, value: ''},
    [ModelProperty.Vendor]: {editing: false, value: ''},
    [ModelProperty.Notes]: {editing: false, value: ''},
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

  const onLastEventDateChange = (date?: Date) => {
    // Set value while leaving the editing state unchanged.
    date && setFilter({
      [ModelProperty.LastEvent]: {
        editing: filter[ModelProperty.LastEvent].editing,
        value: DateTime.fromJSDate(date).toISO() || new Date().toISOString()
      }
    });
  };

  const onOperatorSelect = (property: ModelProperty, index: number) => {
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
        title={'Model Type'}
        position={filter[ModelProperty.ModelType].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: '  Is  ' }, { label: 'Is Not' }]}
        onChangeIndex={index => onOperatorSelect(ModelProperty.ModelType, index)}
        expanded={filter[ModelProperty.ModelType].editing}
        ExpandableComponent={
          <ListItem
            title={'Value'}
            value={filter[ModelProperty.ModelType].value}
            position={['last']}
            onPress={() => null}
          />
        }
      />
      <Divider />
      <ListItemSegmented
        title={'Last Event'}
        position={filter[ModelProperty.LastEvent].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: 'Before' }, { label: 'After' }, { label: 'Past' }]}
        onChangeIndex={index => onOperatorSelect(ModelProperty.LastEvent, index)}
        expanded={filter[ModelProperty.LastEvent].editing}
        ExpandableComponent={
          <ListItemDate
            title={'Date'}
            value={filter[ModelProperty.LastEvent].value
              ? DateTime.fromISO(filter[ModelProperty.LastEvent].value).toFormat(
                "MMM d, yyyy 'at' hh:mm a"
              )
              : 'Tap to Set...'}
            pickerValue={filter[ModelProperty.LastEvent].value}
            rightImage={false}
            expanded={filter[ModelProperty.LastEvent].editing}
            position={['last']}
            onDateChange={onLastEventDateChange}
          />
        }
      />
      <Divider />
      <ListItemSegmented
        title={'Total Time'}
        position={filter[ModelProperty.TotalTime].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: '  <  ' }, { label: '  >  ' }, { label: '  =  ' }, { label: '  !=  ' }]}
        onChangeIndex={index => onOperatorSelect(ModelProperty.TotalTime, index)}
        expanded={filter[ModelProperty.TotalTime].editing}
        ExpandableComponent={
          <ListItemInput
            title={'Value'}
            label={'h:mm'}
            position={['last']}
            value={filter[ModelProperty.TotalTime].value}
          />
        }
      />
      <Divider />
      <ListItemSegmented
        title={'Log Batteries'}
        position={filter[ModelProperty.LogBatteries].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: 'Yes' }, { label: ' No ' }]}
        onChangeIndex={index => onOperatorSelect(ModelProperty.LogBatteries, index)}
      />
      <Divider />
      <ListItemSegmented
        title={'Log Fuel'}
        position={filter[ModelProperty.LogFuel].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: 'Yes' }, { label: ' No ' }]}
        onChangeIndex={index => onOperatorSelect(ModelProperty.LogFuel, index)}
      />
      <Divider />
      <ListItemSegmented
        title={'Damaged'}
        position={filter[ModelProperty.Damaged].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: 'Yes' }, { label: ' No ' }]}
        onChangeIndex={index => onOperatorSelect(ModelProperty.Damaged, index)}
      />
      <Divider />
      <ListItemSegmented
        title={'Vendor'}
        position={filter[ModelProperty.Vendor].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: 'Contains' }, { label: 'Missing' }]}
        onChangeIndex={index => onOperatorSelect(ModelProperty.Vendor, index)}
        expanded={filter[ModelProperty.Vendor].editing}
        ExpandableComponent={
          <ListItem
            title={'The Text'}
            titleStyle={!filter[ModelProperty.Vendor].value ? {color: theme.colors.assertive}: {}}
            subtitle={!filter[ModelProperty.Vendor].value ?  'Matching text not specified' : filter[ModelProperty.Vendor].value}
            position={['last']}
            onPress={() => null}
          />
        }
      />
      <Divider />
      <ListItemSegmented
        title={'Notes'}
        position={filter[ModelProperty.Notes].editing ? ['first'] : ['first', 'last']}
        segments={[{ label: 'Any' }, { label: 'Contains' }, { label: 'Missing' }]}
        onChangeIndex={index => onOperatorSelect(ModelProperty.Notes, index)}
        expanded={filter[ModelProperty.Notes].editing}
        ExpandableComponent={
          <ListItem
            title={'The Text'}
            titleStyle={!filter[ModelProperty.Notes].value ? {color: theme.colors.assertive}: {}}
            subtitle={!filter[ModelProperty.Notes].value ?  'Matching text not specified' : filter[ModelProperty.Notes].value}
            position={['last']}
            onPress={() => null}
          />
        }
      />
      <View style={{height: theme.insets.bottom}}/>
    </ScrollView>
  );
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

export default ModelFilterEditorScreen;
