import React from 'react';
import { ScrollView } from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';

import { Divider, useDevice, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyView } from 'components/molecules/EmptyView';
import { FilterEditorHeader } from 'components/molecules/FilterEditorHeader';
import {
  ListItemFilterDate,
  ListItemFilterEnum,
  ListItemFilterNumber,
} from 'components/molecules/filters';
import { Masks } from 'lib/inputMasks';
import { defaultFilter } from 'lib/reports/reportEvents';
import { useFilterEditor } from 'lib/useFilterEditor';
import { ReportEventFilterValues } from 'types/filter';
import { ReportEventFiltersNavigatorParamList } from 'types/navigation';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<
  ReportEventFiltersNavigatorParamList,
  'ReportEventFilterEditor'
>;

const ReportEventFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, generalFilterName, requireFilterName } =
    route.params;

  const theme = useTheme();
  const device = useDevice();

  const filterEditor = useFilterEditor<ReportEventFilterValues>({
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
    <AvoidSoftInputView>
      <ScrollView style={theme.styles.view}>
        <FilterEditorHeader
          filterEditor={filterEditor}
          itemName={'event'}
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
          title={'Duration'}
          value={filterEditor.values.duration.value}
          relation={filterEditor.values.duration.relation}
          numericProps={{
            mask: Masks.MINUTES_SECONDS,
            placeholder: '0:00',
            units: 'm:ss',
          }}
          position={['first', 'last']}
          onValueChange={filterState => {
            filterEditor.onFilterValueChange('duration', filterState);
          }}
        />
        <Divider />
        <ListItemFilterEnum
          title={'Pilot'}
          value={filterEditor.values.pilot.value}
          relation={filterEditor.values.pilot.relation}
          enumName={'Pilot'}
          position={['first', 'last']}
          onValueChange={filterState => {
            filterEditor.onFilterValueChange('pilot', filterState);
          }}
        />
        <Divider />
        <ListItemFilterEnum
          title={'Location'}
          value={filterEditor.values.location.value}
          relation={filterEditor.values.location.relation}
          enumName={'Location'}
          position={['first', 'last']}
          onValueChange={filterState => {
            filterEditor.onFilterValueChange('location', filterState);
          }}
        />
        <Divider />
        <ListItemFilterEnum
          title={'Event Style'}
          value={filterEditor.values.eventStyle.value}
          relation={filterEditor.values.eventStyle.relation}
          enumName={'EventStyle'}
          position={['first', 'last']}
          onValueChange={filterState => {
            filterEditor.onFilterValueChange('eventStyle', filterState);
          }}
        />
        <Divider />
        <ListItemFilterEnum
          title={'Outcome'}
          value={filterEditor.values.outcome.value}
          relation={filterEditor.values.outcome.relation}
          enumName={'EventOutcome'}
          position={['first', 'last']}
          onValueChange={filterState => {
            filterEditor.onFilterValueChange('outcome', filterState);
          }}
        />
        <Divider style={{ height: device.insets.bottom }} />
      </ScrollView>
    </AvoidSoftInputView>
  );
};

export default ReportEventFilterEditorScreen;
