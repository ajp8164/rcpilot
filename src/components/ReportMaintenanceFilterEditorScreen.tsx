import { Divider } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyView } from 'components/molecules/EmptyView';
import { FilterEditorHeader } from 'components/molecules/FilterEditorHeader';
import {
  ListItemFilterDate,
  ListItemFilterEnum,
  ListItemFilterNumber,
  ListItemFilterString,
} from 'components/molecules/filters';
import { Masks } from 'lib/inputMasks';
import { defaultFilter } from 'lib/reports/reportMaintenance';
import { useFilterEditor } from 'lib/useFilterEditor';
import React from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from 'theme';
import { ReportMaintenanceFilterValues } from 'types/filter';
import { ReportMaintenanceFiltersNavigatorParamList } from 'types/navigation';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<
  ReportMaintenanceFiltersNavigatorParamList,
  'ReportMaintenanceFilterEditor'
>;

const ReportMaintenanceFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, generalFilterName, requireFilterName } =
    route.params;

  const theme = useTheme();

  const filterEditor = useFilterEditor<ReportMaintenanceFilterValues>({
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
        itemName={'maintenance log'}
        requireFilterName={requireFilterName}
        defaultFilter={defaultFilter}
      />
      <ListItemFilterEnum
        title={'Model'}
        value={filterEditor.values.model.value}
        relation={filterEditor.values.model.relation}
        enumName={'Model'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('model', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Model Type'}
        value={filterEditor.values.modelType.value}
        relation={filterEditor.values.modelType.relation}
        enumName={'ModelType'}
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
        enumName={'ModelCategory'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('category', filterState);
        }}
      />
      <Divider />
      <ListItemFilterDate
        title={'Date'}
        value={filterEditor.values.date.value}
        relation={filterEditor.values.date.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('date', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Costs'}
        value={filterEditor.values.costs.value}
        relation={filterEditor.values.costs.relation}
        numericProps={{ mask: Masks.CURRENCY, placeholder: '$0.00' }}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('costs', filterState);
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
      <Divider style={{ height: theme.insets.bottom }} />
    </ScrollView>
  );
};

export default ReportMaintenanceFilterEditorScreen;
