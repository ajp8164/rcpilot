import React from 'react';
import { ScrollView } from 'react-native';

import { Divider, useDevice, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyView } from 'components/molecules/EmptyView';
import { FilterEditorHeader } from 'components/molecules/FilterEditorHeader';
import {
  ListItemFilterBoolean,
  ListItemFilterDate,
  ListItemFilterEnum,
  ListItemFilterNumber,
  ListItemFilterString,
} from 'components/molecules/filters';
import { Masks } from 'lib/inputMasks';
import { defaultFilter } from 'lib/model';
import { useFilterEditor } from 'lib/useFilterEditor';
import { ModelFilterValues } from 'types/filter';
import { ModelFiltersNavigatorParamList } from 'types/navigation';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<
  ModelFiltersNavigatorParamList,
  'ModelFilterEditor'
>;

const ModelFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, generalFilterName, requireFilterName } =
    route.params;

  const theme = useTheme();
  const device = useDevice();

  const filterEditor = useFilterEditor<ModelFilterValues>({
    filterId,
    filterType,
    defaultFilter,
    filterValueLabels,
    generalFilterName,
  });

  if (!filterEditor.filter) {
    return <EmptyView error message={'Filter Not Found!'} />;
  }

  return (
    <ScrollView style={theme.styles.view}>
      <FilterEditorHeader
        filterEditor={filterEditor}
        itemName={'model'}
        requireFilterName={requireFilterName}
        defaultFilter={defaultFilter}
      />
      <ListItemFilterEnum
        title={'Model Type'}
        value={filterEditor.values.modelType.value}
        relation={filterEditor.values.modelType.relation}
        enumName={'ModelType'}
        position={['first', 'last']}
        onValueChange={filterState => {
          {
            console.log(filterState);
            filterEditor.onFilterValueChange('modelType', filterState);
          }
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Category'}
        value={filterEditor.values.category.value}
        relation={filterEditor.values.category.relation}
        enumName={'ModelCategory'}
        position={['first', 'last']}
        onValueChange={filterState =>
          filterEditor.onFilterValueChange('category', filterState)
        }
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
        value={filterEditor.values.totalTime.value}
        relation={filterEditor.values.totalTime.relation}
        numericProps={{
          mask: Masks.HOURS_MINUTES,
          placeholder: '0:00',
          units: 'h:mm',
        }}
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
      <Divider style={{ height: device.insets.bottom }} />
    </ScrollView>
  );
};

export default ModelFilterEditorScreen;
