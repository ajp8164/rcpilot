import { Divider } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyView } from 'components/molecules/EmptyView';
import { FilterEditorHeader } from 'components/molecules/FilterEditorHeader';
import {
  ListItemFilterDate,
  ListItemFilterEnum,
} from 'components/molecules/filters';
import { defaultFilter } from 'lib/reports/reportModelScanCode';
import { useFilterEditor } from 'lib/useFilterEditor';
import React from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from 'theme';
import { ReportModelScanCodeFilterValues } from 'types/filter';
import { ReportModelScanCodeFiltersNavigatorParamList } from 'types/navigation';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<
  ReportModelScanCodeFiltersNavigatorParamList,
  'ReportModelScanCodeFilterEditor'
>;

const ReportModelScanCodeFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, generalFilterName, requireFilterName } =
    route.params;

  const theme = useTheme();

  const filterEditor = useFilterEditor<ReportModelScanCodeFilterValues>({
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
        value={filterEditor.values.lastEvent.value}
        relation={filterEditor.values.lastEvent.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('lastEvent', filterState);
        }}
      />
      <Divider style={{ height: theme.insets.bottom }} />
    </ScrollView>
  );
};

export default ReportModelScanCodeFilterEditorScreen;
