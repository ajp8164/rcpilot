import { AppTheme, useTheme } from 'theme';
import { BooleanRelation, DateRelation, EnumRelation, ListItemFilterBoolean, ListItemFilterDate, ListItemFilterEnum, ListItemFilterNumber, ListItemFilterString, NumberRelation, StringRelation } from 'components/molecules/filters';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { ModelFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';
import { useSetState } from '@react-native-ajp-elements/core';

enum ModelProperty {
  ModelType = 'modelType',
  Category = 'category',
  LastEvent ='lastEvent',
  TotalTime = 'totalTime',
  LogsBatteries = 'logsBatteries',
  LogsFuel = 'logsFuel',
  Damaged = 'damaged',
  Vendor = 'vendor',
  Notes = 'notes',
};

type FilterState = {
  relation: BooleanRelation | DateRelation | EnumRelation | NumberRelation | StringRelation;
  value: string;
};

export type Props = NativeStackScreenProps<ModelFiltersNavigatorParamList, 'ModelFilterEditor'>;

const ModelFilterEditorScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [createSavedFilter, setCreateSavedFilter] = useState(false);

  const [filter, setFilter] = useSetState<{[key in ModelProperty] : FilterState}>({
    [ModelProperty.ModelType]: {relation: EnumRelation.Any, value: ''},
    [ModelProperty.Category]: {relation: EnumRelation.Any, value: ''},
    [ModelProperty.LastEvent]: {relation: DateRelation.Any, value: ''},
    [ModelProperty.TotalTime]: {relation: NumberRelation.Any, value: ''},
    [ModelProperty.LogsBatteries]: {relation: BooleanRelation.Any, value: ''},
    [ModelProperty.LogsFuel]: {relation: BooleanRelation.Any, value: ''},
    [ModelProperty.Damaged]: {relation: BooleanRelation.Any, value: ''},
    [ModelProperty.Vendor]: {relation: StringRelation.Any, value: ''},
    [ModelProperty.Notes]: {relation: StringRelation.Any, value: ''},
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

  const onFilterValueChange = (property: ModelProperty, value: FilterState) => {
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
        title={'Reset Filter...'}
        titleStyle={s.reset}
        disabled={true}
        disabledStyle={s.resetDisabled}
        position={['first', 'last']}
        rightImage={false}
        onPress={() => null}
      />
      <Divider text={'This filter shows all the models that match all of these criteria.'}/>
      <ListItemFilterEnum
        title={'Model Type'}
        value={filter[ModelProperty.ModelType].value}
        relation={EnumRelation.Any}
        enumName={'ModelTypes'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(ModelProperty.ModelType, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterEnum
        title={'Category'}
        value={filter[ModelProperty.Category].value}
        relation={EnumRelation.Any}
        enumName={'Categories'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(ModelProperty.ModelType, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterDate
        title={'Last Event'}
        value={filter[ModelProperty.LastEvent].value}
        relation={DateRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(ModelProperty.LastEvent, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterNumber
        title={'Total Time'}
        label={'h:mm'}
        value={filter[ModelProperty.TotalTime].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(ModelProperty.TotalTime, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterBoolean
        title={'Logs Batteries'}
        value={filter[ModelProperty.LogsBatteries].value}
        relation={BooleanRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(ModelProperty.LogsBatteries, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterBoolean
        title={'Logs Fuel'}
        value={filter[ModelProperty.LogsFuel].value}
        relation={BooleanRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(ModelProperty.LogsFuel, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterBoolean
        title={'Damaged'}
        value={filter[ModelProperty.Damaged].value}
        relation={BooleanRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(ModelProperty.Damaged, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterString
        title={'Vendor'}
        value={filter[ModelProperty.Vendor].value}
        relation={StringRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(ModelProperty.Vendor, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterString
        title={'Notes'}
        value={filter[ModelProperty.Notes].value}
        relation={StringRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(ModelProperty.Notes, {relation, value});
        } }
      />
      <View style={{height: theme.insets.bottom}}/>
    </ScrollView>
  );
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

export default ModelFilterEditorScreen;
