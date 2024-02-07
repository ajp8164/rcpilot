import { AppTheme, useTheme } from 'theme';
import { BooleanRelation, DateRelation, EnumRelation, FilterState, ListItemFilterBoolean, ListItemFilterDate, ListItemFilterEnum, ListItemFilterNumber, ListItemFilterString, NumberRelation, StringRelation } from 'components/molecules/filters';
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

export type Props = NativeStackScreenProps<ModelFiltersNavigatorParamList, 'ModelFilterEditor'>;

const ModelFilterEditorScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [createSavedFilter, setCreateSavedFilter] = useState(false);

  const [filter, setFilter] = useSetState<{[key in ModelProperty] : FilterState}>({
    [ModelProperty.ModelType]: {relation: EnumRelation.Any, value: []},
    [ModelProperty.Category]: {relation: EnumRelation.Any, value: []},
    [ModelProperty.LastEvent]: {relation: DateRelation.Any, value: []},
    [ModelProperty.TotalTime]: {relation: NumberRelation.Any, value: []},
    [ModelProperty.LogsBatteries]: {relation: BooleanRelation.Any, value: []},
    [ModelProperty.LogsFuel]: {relation: BooleanRelation.Any, value: []},
    [ModelProperty.Damaged]: {relation: BooleanRelation.Any, value: []},
    [ModelProperty.Vendor]: {relation: StringRelation.Any, value: []},
    [ModelProperty.Notes]: {relation: StringRelation.Any, value: []},
  });

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button
          title={'Cancel'}
          titleStyle={theme.styles.buttonScreenHeaderTitle}
          buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
          onPress={navigation.goBack}
        />
      ),
      headerRight: () => (
        <Button
        title={'Done'}
        titleStyle={theme.styles.buttonScreenHeaderTitle}
        buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
        // onPress={onDone}
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
        title={'Reset Filter'}
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
        onValueChange={filterState => {
          onFilterValueChange(ModelProperty.ModelType, filterState);
        } }
      />
      <Divider />
      <ListItemFilterEnum
        title={'Category'}
        value={filter[ModelProperty.Category].value}
        relation={EnumRelation.Any}
        enumName={'Categories'}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(ModelProperty.Category, filterState);
        } }
      />
      <Divider />
      <ListItemFilterDate
        title={'Last Event'}
        value={filter[ModelProperty.LastEvent].value}
        relation={DateRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(ModelProperty.LastEvent, filterState);
        } }
      />
      <Divider />
      <ListItemFilterNumber
        title={'Total Time'}
        label={'h:mm'}
        value={filter[ModelProperty.TotalTime].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(ModelProperty.TotalTime, filterState);
        } }
      />
      <Divider />
      <ListItemFilterBoolean
        title={'Logs Batteries'}
        value={filter[ModelProperty.LogsBatteries].value[0]}
        relation={BooleanRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(ModelProperty.LogsBatteries, filterState);
        } }
      />
      <Divider />
      <ListItemFilterBoolean
        title={'Logs Fuel'}
        value={filter[ModelProperty.LogsFuel].value[0]}
        relation={BooleanRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(ModelProperty.LogsFuel, filterState);
        } }
      />
      <Divider />
      <ListItemFilterBoolean
        title={'Damaged'}
        value={filter[ModelProperty.Damaged].value[0]}
        relation={BooleanRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(ModelProperty.Damaged, filterState);
        } }
      />
      <Divider />
      <ListItemFilterString
        title={'Vendor'}
        value={filter[ModelProperty.Vendor].value}
        relation={StringRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(ModelProperty.Vendor, filterState);
        } }
      />
      <Divider />
      <ListItemFilterString
        title={'Notes'}
        value={filter[ModelProperty.Notes].value}
        relation={StringRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange(ModelProperty.Notes, filterState);
        } }
      />
      <View style={{height: theme.insets.bottom}}/>
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  reset: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderButtonText,
  },
  resetDisabled: {
    opacity: 0.3,
  }
}));

export default ModelFilterEditorScreen;
