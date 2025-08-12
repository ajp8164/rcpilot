import { Divider } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyView } from 'components/molecules/EmptyView';
import { FilterEditorHeader } from 'components/molecules/FilterEditorHeader';
import {
  ListItemFilterDate,
  ListItemFilterNumber,
  ListItemFilterString,
} from 'components/molecules/filters';
import { Masks } from 'lib/inputMasks';
import { defaultFilter } from 'lib/maintenance';
import { useFilterEditor } from 'lib/useFilterEditor';
import React from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from 'theme';
import { MaintenanceFilterValues } from 'types/filter';
import { MaintenanceFiltersNavigatorParamList } from 'types/navigation';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<
  MaintenanceFiltersNavigatorParamList,
  'MaintenanceFilterEditor'
>;

const MaintenanceFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, generalFilterName, requireFilterName } =
    route.params;

  const theme = useTheme();

  const filterEditor = useFilterEditor<MaintenanceFilterValues>({
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

export default MaintenanceFilterEditorScreen;
