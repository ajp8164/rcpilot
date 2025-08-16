import { Divider, useDevice, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyView } from 'components/molecules/EmptyView';
import { FilterEditorHeader } from 'components/molecules/FilterEditorHeader';
import {
  ListItemFilterEnum,
  ListItemFilterNumber,
} from 'components/molecules/filters';
import { Masks } from 'lib/inputMasks';
import { defaultFilter } from 'lib/reports/reportBatteryScanCode';
import { useFilterEditor } from 'lib/useFilterEditor';
import React from 'react';
import { ScrollView } from 'react-native';
import { ReportBatteryScanCodeFilterValues } from 'types/filter';
import { ReportBatteryScanCodeFiltersNavigatorParamList } from 'types/navigation';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<
  ReportBatteryScanCodeFiltersNavigatorParamList,
  'ReportBatteryScanCodeFilterEditor'
>;

const ReportBatteryScanCodeFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, generalFilterName, requireFilterName } =
    route.params;

  const theme = useTheme();
  const device = useDevice();

  const filterEditor = useFilterEditor<ReportBatteryScanCodeFilterValues>({
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
        title={'Capacity'}
        value={filterEditor.values.capacity.value}
        relation={filterEditor.values.capacity.relation}
        numericProps={{ mask: Masks.MAH, placeholder: '0', units: 'mAh' }}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('capacity', filterState);
        }}
      />
      <Divider style={{ height: device.insets.bottom }} />
    </ScrollView>
  );
};

export default ReportBatteryScanCodeFilterEditorScreen;
