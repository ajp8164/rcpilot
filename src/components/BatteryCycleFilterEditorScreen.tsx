import React from 'react';
import { ScrollView } from 'react-native';

import { Divider, useDevice, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyView } from 'components/molecules/EmptyView';
import { FilterEditorHeader } from 'components/molecules/FilterEditorHeader';
import {
  ListItemFilterDate,
  ListItemFilterNumber,
  ListItemFilterString,
} from 'components/molecules/filters';
import { defaultFilter } from 'lib/batteryCycle';
import { Masks } from 'lib/inputMasks';
import { useFilterEditor } from 'lib/useFilterEditor';
import { BatteryCycleFilterValues } from 'types/filter';
import { BatteryCycleFiltersNavigatorParamList } from 'types/navigation';

export const generalBatteryCyclesFilterName = 'general-battery-cycles-filter';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<
  BatteryCycleFiltersNavigatorParamList,
  'BatteryCycleFilterEditor'
>;

const BatteryCycleFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, requireFilterName } = route.params;

  const theme = useTheme();
  const device = useDevice();

  const filterEditor = useFilterEditor<BatteryCycleFilterValues>({
    filterId,
    filterType,
    defaultFilter,
    filterValueLabels,
    generalFilterName: generalBatteryCyclesFilterName,
  });

  if (!filterEditor.filter) {
    return <EmptyView error message={'Filter Not Found!'} />;
  }

  return (
    <ScrollView style={theme.styles.view}>
      <FilterEditorHeader
        filterEditor={filterEditor}
        itemName={'battery cycle'}
        requireFilterName={requireFilterName}
        defaultFilter={defaultFilter}
      />
      <ListItemFilterDate
        title={'Discharge Date'}
        value={filterEditor.values.dischargeDate.value}
        relation={filterEditor.values.dischargeDate.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('dischargeDate', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'D. Duration'}
        value={filterEditor.values.dischargeDuration.value}
        relation={filterEditor.values.dischargeDuration.relation}
        numericProps={{
          mask: Masks.MINUTES_SECONDS,
          placeholder: '0:00',
          units: 'm:ss',
        }}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('dischargeDuration', filterState);
        }}
      />
      <Divider />
      <ListItemFilterDate
        title={'Charge Date'}
        value={filterEditor.values.chargeDate.value}
        relation={filterEditor.values.chargeDate.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('chargeDate', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'C. Amount'}
        value={filterEditor.values.chargeAmount.value}
        relation={filterEditor.values.chargeAmount.relation}
        numericProps={{ mask: Masks.C_RATING, placeholder: '0', units: 'mAh' }}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('chargeAmount', filterState);
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

export default BatteryCycleFilterEditorScreen;
