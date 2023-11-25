import { AppTheme, useTheme } from 'theme';
import { EnumRelation, ListItemFilterEnum, ListItemFilterNumber, NumberRelation } from 'components/molecules/filters';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
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
  relation: EnumRelation | NumberRelation;
  value: string;
};

export type Props = NativeStackScreenProps<BatteryFiltersNavigatorParamList, 'BatteryFilterEditor'>;

const BatteryFilterEditorScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [createSavedFilter, setCreateSavedFilter] = useState(false);

  const [filter, setFilter] = useSetState<{[key in BatteryProperty] : FilterState}>({
    [BatteryProperty.Chemistry]: {relation: EnumRelation.Any, value: ''},
    [BatteryProperty.TotalTime]: {relation: NumberRelation.Any, value: ''},
    [BatteryProperty.Capacity]: {relation: NumberRelation.Any, value: ''},
    [BatteryProperty.CRating]: {relation: NumberRelation.Any, value: ''},
    [BatteryProperty.SCells]: {relation: NumberRelation.Any, value: ''},
    [BatteryProperty.PCells]: {relation: NumberRelation.Any, value: ''},
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

  const onFilterValueChange = (property: BatteryProperty, value: FilterState) => {
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
      <Divider text={'This filter shows all the batteries that match all of these criteria.'}/>
      <ListItemFilterEnum
        title={'Chemistry'}
        value={filter[BatteryProperty.Chemistry].value}
        relation={EnumRelation.Any}
        position={['first', 'last']}
        pickerScreen={'BatteryFilterChemistry'}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryProperty.Chemistry, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterNumber
        title={'Total Time'}
        label={'h:mm'}
        value={filter[BatteryProperty.TotalTime].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryProperty.TotalTime, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterNumber
        title={'Capacity'}
        label={'mAh'}
        value={filter[BatteryProperty.Capacity].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryProperty.Capacity, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterNumber
        title={'C Rating'}
        label={'C'}
        value={filter[BatteryProperty.Capacity].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryProperty.Capacity, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterNumber
        title={'S Cells'}
        value={filter[BatteryProperty.SCells].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryProperty.SCells, {relation, value});
        } }
      />
      <Divider />
      <ListItemFilterNumber
        title={'P Cells'}
        value={filter[BatteryProperty.PCells].value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryProperty.PCells, {relation, value});
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

export default BatteryFilterEditorScreen;
