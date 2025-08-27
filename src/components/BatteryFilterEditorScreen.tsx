import React from 'react';
import { ScrollView } from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';

import { Divider, useDevice, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyView } from 'components/molecules/EmptyView';
import { FilterEditorHeader } from 'components/molecules/FilterEditorHeader';
import {
  ListItemFilterEnum,
  ListItemFilterNumber,
} from 'components/molecules/filters';
import { defaultFilter } from 'lib/battery';
import { Masks } from 'lib/inputMasks';
import { useFilterEditor } from 'lib/useFilterEditor';
import { BatteryFilterValues } from 'types/filter';
import { BatteryFiltersNavigatorParamList } from 'types/navigation';

export const generalBatteriesFilterName = 'general-batteries-filter';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<
  BatteryFiltersNavigatorParamList,
  'BatteryFilterEditor'
>;

const BatteryFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, generalFilterName, requireFilterName } =
    route.params;

  const theme = useTheme();
  const device = useDevice();

  const filterEditor = useFilterEditor<BatteryFilterValues>({
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
          itemName={'battery'}
          requireFilterName={requireFilterName}
          defaultFilter={defaultFilter}
        />
        <ListItemFilterEnum
          title={'Chemistry'}
          value={filterEditor.values.chemistry.value}
          relation={filterEditor.values.chemistry.relation}
          enumName={'BatteryChemistry'}
          position={['first', 'last']}
          onValueChange={filterState => {
            filterEditor.onFilterValueChange('chemistry', filterState);
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
        <ListItemFilterNumber
          title={'Capacity'}
          numericProps={{ mask: Masks.MAH, placeholder: '0', units: 'mAh' }}
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
          value={filterEditor.values.cRating.value}
          relation={filterEditor.values.cRating.relation}
          numericProps={{ mask: Masks.C_RATING, placeholder: '0', units: 'C' }}
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
          numericProps={{ mask: Masks.BATTERY_CELL_COUNT, placeholder: '0' }}
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
          numericProps={{ mask: Masks.BATTERY_CELL_COUNT, placeholder: '0' }}
          position={['first', 'last']}
          onValueChange={filterState => {
            filterEditor.onFilterValueChange('pCells', filterState);
          }}
        />
        <Divider style={{ height: device.insets.bottom }} />
      </ScrollView>
    </AvoidSoftInputView>
  );
};

export default BatteryFilterEditorScreen;
