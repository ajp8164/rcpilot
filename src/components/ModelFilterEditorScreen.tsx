import { AppTheme, useTheme } from 'theme';
import { FilterType, ModelFilterValues } from 'types/filter';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import {
  ListItemFilterBoolean,
  ListItemFilterDate,
  ListItemFilterEnum,
  ListItemFilterNumber,
  ListItemFilterString,
} from 'components/molecules/filters';

import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { ModelFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView } from 'react-native';
import { defaultFilter } from 'lib/model';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useFilterEditor } from 'lib/useFilterEditor';

export const generalModelsFilterName = 'general-models-filter';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<ModelFiltersNavigatorParamList, 'ModelFilterEditor'>;

const ModelFilterEditorScreen = ({ route }: Props) => {
  const { filterId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  const filterEditor = useFilterEditor<ModelFilterValues>({
    filterId,
    filterType: FilterType.ModelsFilter,
    defaultFilter,
    filterValueLabels,
    generalFilterName: generalModelsFilterName,
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
      <Divider text={'This filter shows all the models that match all of these criteria.'}/>
      <ListItemFilterEnum
        title={'Model Type'}
        value={filterEditor.values.modelType.value}
        relation={filterEditor.values.modelType.relation}
        enumName={'ModelTypes'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('modelType', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Category'}
        value={filterEditor.values.category.value}
        relation={filterEditor.values.category.relation}
        enumName={'Categories'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('category', filterState);
        }}
      />
      <Divider />
      <ListItemFilterDate
        title={'Last Event'}
        value={filterEditor.values.lastEvent.value}
        relation={filterEditor.values.lastEvent.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('lastEvent', filterState);
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
      <ListItemFilterBoolean
        title={'Logs Batteries'}
        relation={filterEditor.values.logsBatteries.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('logsBatteries', filterState);
        }}
      />
      <Divider />
      <ListItemFilterBoolean
        title={'Logs Fuel'}
        relation={filterEditor.values.logsFuel.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('logsFuel', filterState);
        }}
      />
      <Divider />
      <ListItemFilterBoolean
        title={'Damaged'}
        relation={filterEditor.values.damaged.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('damaged', filterState);
        }}
      />
      <Divider />
      <ListItemFilterString
        title={'Vendor'}
        value={filterEditor.values.vendor.value}
        relation={filterEditor.values.vendor.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('vendor', filterState);
        }}
      />
      <Divider />
      <ListItemFilterString
        title={'Notes'}
        value={filterEditor.values.notes.value}
        relation={filterEditor.values.notes.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('notes', filterState);
        }}
      />
      <Divider style={{height: theme.insets.bottom}} />
    </ScrollView>
  );
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

export default ModelFilterEditorScreen;
