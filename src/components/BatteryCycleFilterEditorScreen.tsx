import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import {
  ListItemFilterDate,
  ListItemFilterNumber,
  ListItemFilterString,
} from 'components/molecules/filters';
import React, { useEffect } from 'react';

import { BatteryCycleFilterValues } from 'types/filter';
import { BatteryCycleFiltersNavigatorParamList } from 'types/navigation';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView } from 'react-native';
import { defaultFilter } from 'lib/batteryCycle';
import lodash from 'lodash';
import { makeStyles } from '@rn-vui/themed';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useFilterEditor } from 'lib/useFilterEditor';

export const generalBatteryCyclesFilterName = 'general-battery-cycles-filter';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<
  BatteryCycleFiltersNavigatorParamList,
  'BatteryCycleFilterEditor'
>;

const BatteryCycleFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, requireFilterName } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const setDebounced = useDebouncedRender();

  const filterEditor = useFilterEditor<BatteryCycleFilterValues>({
    filterId,
    filterType,
    defaultFilter,
    filterValueLabels,
    generalFilterName: generalBatteryCyclesFilterName,
  });

  useEffect(() => {
    if (requireFilterName) {
      filterEditor.setCreateSavedFilter(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!filterEditor.filter) {
    return <EmptyView error message={'Filter Not Found!'} />;
  }

  return (
    <ScrollView style={theme.styles.view}>
      <Divider text={'FILTER NAME'} />
      {filterEditor.name === filterEditor.generalFilterName || requireFilterName ? (
        <ListItemSwitch
          title={'Create a Saved Filter'}
          position={filterEditor.createSavedFilter ? ['first'] : ['first', 'last']}
          value={filterEditor.createSavedFilter}
          disabled={requireFilterName}
          expanded={filterEditor.createSavedFilter}
          onValueChange={filterEditor.setCreateSavedFilter}
          ExpandableComponent={
            <ListItemInput
              value={filterEditor.customName}
              placeholder={'Filter Name'}
              position={['last']}
              onChangeText={value => setDebounced(() => filterEditor.setCustomName(value))}
            />
          }
        />
      ) : (
        <ListItemInput
          value={filterEditor.name}
          placeholder={'Filter Name'}
          position={['first', 'last']}
          onChangeText={value => setDebounced(() => filterEditor.setName(value))}
        />
      )}
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
      <Divider
        text={'This filter shows all the battery cycles that match all of these criteria.'}
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
        label={'m:ss'}
        value={filterEditor.values.dischargeDuration.value}
        relation={filterEditor.values.dischargeDuration.relation}
        numericProps={{ prefix: '', separator: ':' }}
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
        label={'mAh'}
        value={filterEditor.values.chargeAmount.value}
        relation={filterEditor.values.chargeAmount.relation}
        numericProps={{ prefix: '' }}
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
      <Divider style={{ height: theme.insets.bottom }} />
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
  },
}));

export default BatteryCycleFilterEditorScreen;
