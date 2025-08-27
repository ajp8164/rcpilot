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
  ListItemFilterString,
} from 'components/molecules/filters';
import { Masks } from 'lib/inputMasks';
import { defaultFilter, eventKind } from 'lib/modelEvent';
import { useFilterEditor } from 'lib/useFilterEditor';
import { EventFilterValues } from 'types/filter';
import { EventFiltersNavigatorParamList } from 'types/navigation';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<
  EventFiltersNavigatorParamList,
  'EventFilterEditor'
>;

const EventFilterEditorScreen = ({ route }: Props) => {
  const {
    filterId,
    filterType,
    generalFilterName,
    modelType,
    requireFilterName,
  } = route.params;

  const theme = useTheme();
  const device = useDevice();

  const filterEditor = useFilterEditor<EventFilterValues>({
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
          itemName={eventKind(modelType).namePlural.toLowerCase()}
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
          title={'Style'}
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
          title={'Battery'}
          value={filterEditor.values.battery.value}
          relation={filterEditor.values.battery.relation}
          enumName={'Battery'}
          position={['first', 'last']}
          onValueChange={filterState => {
            filterEditor.onFilterValueChange('battery', filterState);
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
          title={'Outcome'}
          value={filterEditor.values.outcome.value}
          relation={filterEditor.values.outcome.relation}
          enumName={'EventOutcome'}
          position={['first', 'last']}
          onValueChange={filterState => {
            filterEditor.onFilterValueChange('outcome', filterState);
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
    </AvoidSoftInputView>
  );
};

export default EventFilterEditorScreen;
