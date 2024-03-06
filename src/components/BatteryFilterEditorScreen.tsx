import { AppTheme, useTheme } from 'theme';
import { BatteryFilterValues, FilterType } from 'types/filter';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import { ListItemFilterEnum, ListItemFilterNumber } from 'components/molecules/filters';
import { ScrollView, View } from 'react-native';

import { BatteryFiltersNavigatorParamList } from 'types/navigation';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { defaultFilter } from 'lib/battery';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useFilterEditor } from 'lib/useFilterEditor';

export const generalBatteriesFilterName = 'general-batteries-filter';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<BatteryFiltersNavigatorParamList, 'BatteryFilterEditor'>;

const BatteryFilterEditorScreen = ({ route }: Props) => {
  const { filterId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  const filterEditor = useFilterEditor<BatteryFilterValues>({
    filterId,
    filterType: FilterType.BatteriesFilter,
    defaultFilter,
    filterValueLabels,
    generalFilterName: generalBatteriesFilterName,
  });

  if (!filterEditor.filter) {
    return (
      <EmptyView error message={'Filter Not Found!'} />
    );
  }

  return (
    <ScrollView style={theme.styles.view}>
      <Divider text={'FILTER NAME'}/>
      {filterEditor.name === filterEditor.generalFilterName ?
        <ListItemSwitch
          title={'Create a Saved Filter'}
          position={filterEditor.createSavedFilter ? ['first'] : ['first', 'last']}
          value={filterEditor.createSavedFilter}
          expanded={filterEditor.createSavedFilter}
          onValueChange={filterEditor.setCreateSavedFilter}
          ExpandableComponent={
            <ListItemInput
              value={filterEditor.customName}
              placeholder={'Filter Name'}
              position={['last']}
              onChangeText={filterEditor.setCustomName}
            />
          }
        />
      :
        <ListItemInput
          value={filterEditor.name}
          placeholder={'Filter Name'}
          position={['first', 'last']}
          onChangeText={filterEditor.setName}
        />
      }
      <Divider />
      <ListItem
        title={'Reset Filter'}
        titleStyle={s.reset}
        disabled={lodash.isEqual(filterEditor.values, defaultFilter)}
        disabledStyle={s.resetDisabled}
        position={['first', 'last']}
        rightImage={false}
        onPress={filterEditor.resetFilter}
      />
      <Divider text={'This filter shows all the batteries that match all of these criteria.'}/>
      <ListItemFilterEnum
        title={'Chemistry'}
        value={filterEditor.values.chemistry.value}
        relation={filterEditor.values.chemistry.relation}
        enumName={'Chemistries'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('chemistry', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Total Time'}
        label={'h:mm'}
        value={filterEditor.values.totalTime.value}
        relation={filterEditor.values.totalTime.relation}
        numericProps={{prefix: '', separator: ':'}}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('totalTime', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Capacity'}
        label={'mAh'}
        numericProps={{prefix: '', delimiter: '', precision: 0, maxValue: 99999}}
        value={filterEditor.values.capacity.value}
        relation={filterEditor.values.capacity.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('capacity', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'C Rating'}
        label={'C'}
        value={filterEditor.values.cRating.value}
        relation={filterEditor.values.cRating.relation}
        numericProps={{prefix: '', delimiter: '', precision: 0, maxValue: 999}}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('cRating', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'S Cells'}
        value={filterEditor.values.sCells.value}
        relation={filterEditor.values.sCells.relation}
        numericProps={{prefix: '', delimiter: '', precision: 0, maxValue: 99}}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('sCells', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'P Cells'}
        value={filterEditor.values.pCells.value}
        relation={filterEditor.values.pCells.relation}
        numericProps={{prefix: '', delimiter: '', precision: 0, maxValue: 99}}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('pCells', filterState);
        }}
      />
      <View style={{height: theme.insets.bottom}}/>
    </ScrollView>  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  reset: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.clearButtonText,
  },
  resetDisabled: {
    opacity: 0.3,
  }
}));

export default BatteryFilterEditorScreen;
